// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title InvoiceEscrow
/// @notice Minimal on-chain invoicing. USDC is Arc's native gas token, so
/// payment is a plain native-value transfer — no ERC-20 approve/transferFrom step.
contract InvoiceEscrow {
    struct Invoice {
        address payable issuer;
        address payer; // address(0) means "anyone may pay"
        uint96 amount;
        uint40 dueDate; // 0 means no due date
        bool paid;
        string description;
    }

    uint256 public nextInvoiceId;
    mapping(uint256 => Invoice) public invoices;
    mapping(address => uint256[]) private invoicesByIssuer;

    event InvoiceCreated(
        uint256 indexed id,
        address indexed issuer,
        address indexed payer,
        uint256 amount,
        uint256 dueDate,
        string description
    );
    event InvoicePaid(uint256 indexed id, address indexed payer, uint256 amount);

    error InvoiceNotFound();
    error AlreadyPaid();
    error NotTheDesignatedPayer();
    error WrongAmount();
    error TransferFailed();

    function createInvoice(
        uint96 amount,
        uint40 dueDate,
        address payer,
        string calldata description
    ) external returns (uint256 id) {
        require(amount > 0, "amount must be > 0");

        id = nextInvoiceId++;
        invoices[id] = Invoice({
            issuer: payable(msg.sender),
            payer: payer,
            amount: amount,
            dueDate: dueDate,
            paid: false,
            description: description
        });
        invoicesByIssuer[msg.sender].push(id);

        emit InvoiceCreated(id, msg.sender, payer, amount, dueDate, description);
    }

    function payInvoice(uint256 id) external payable {
        Invoice storage inv = invoices[id];
        if (inv.issuer == address(0)) revert InvoiceNotFound();
        if (inv.paid) revert AlreadyPaid();
        if (inv.payer != address(0) && inv.payer != msg.sender) revert NotTheDesignatedPayer();
        if (msg.value != inv.amount) revert WrongAmount();

        inv.paid = true;

        (bool ok, ) = inv.issuer.call{value: msg.value}("");
        if (!ok) revert TransferFailed();

        emit InvoicePaid(id, msg.sender, msg.value);
    }

    function getInvoice(uint256 id) external view returns (Invoice memory) {
        Invoice memory inv = invoices[id];
        if (inv.issuer == address(0)) revert InvoiceNotFound();
        return inv;
    }

    function getInvoicesByIssuer(address issuer) external view returns (uint256[] memory) {
        return invoicesByIssuer[issuer];
    }
}
