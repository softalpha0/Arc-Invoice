const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InvoiceEscrow", function () {
  async function deployFixture() {
    const [issuer, payer, other] = await ethers.getSigners();
    const InvoiceEscrow = await ethers.getContractFactory("InvoiceEscrow");
    const invoiceEscrow = await InvoiceEscrow.deploy();
    return { invoiceEscrow, issuer, payer, other };
  }

  it("creates an open invoice anyone can pay", async function () {
    const { invoiceEscrow, issuer, payer } = await deployFixture();
    const amount = ethers.parseEther("100");

    await expect(invoiceEscrow.connect(issuer).createInvoice(amount, 0, ethers.ZeroAddress, "logo design"))
      .to.emit(invoiceEscrow, "InvoiceCreated")
      .withArgs(0, issuer.address, ethers.ZeroAddress, amount, 0, "logo design");

    const before = await ethers.provider.getBalance(issuer.address);

    await expect(invoiceEscrow.connect(payer).payInvoice(0, { value: amount }))
      .to.emit(invoiceEscrow, "InvoicePaid")
      .withArgs(0, payer.address, amount);

    const after = await ethers.provider.getBalance(issuer.address);
    expect(after - before).to.equal(amount);

    const invoice = await invoiceEscrow.getInvoice(0);
    expect(invoice.paid).to.equal(true);
  });

  it("rejects payment from the wrong designated payer", async function () {
    const { invoiceEscrow, issuer, payer, other } = await deployFixture();
    const amount = ethers.parseEther("50");

    await invoiceEscrow.connect(issuer).createInvoice(amount, 0, payer.address, "consulting");

    await expect(
      invoiceEscrow.connect(other).payInvoice(0, { value: amount })
    ).to.be.revertedWithCustomError(invoiceEscrow, "NotTheDesignatedPayer");
  });

  it("rejects an incorrect payment amount", async function () {
    const { invoiceEscrow, issuer, payer } = await deployFixture();
    const amount = ethers.parseEther("50");

    await invoiceEscrow.connect(issuer).createInvoice(amount, 0, ethers.ZeroAddress, "consulting");

    await expect(
      invoiceEscrow.connect(payer).payInvoice(0, { value: amount - 1n })
    ).to.be.revertedWithCustomError(invoiceEscrow, "WrongAmount");
  });

  it("rejects double payment", async function () {
    const { invoiceEscrow, issuer, payer } = await deployFixture();
    const amount = ethers.parseEther("10");

    await invoiceEscrow.connect(issuer).createInvoice(amount, 0, ethers.ZeroAddress, "one-off");
    await invoiceEscrow.connect(payer).payInvoice(0, { value: amount });

    await expect(
      invoiceEscrow.connect(payer).payInvoice(0, { value: amount })
    ).to.be.revertedWithCustomError(invoiceEscrow, "AlreadyPaid");
  });

  it("tracks invoices by issuer", async function () {
    const { invoiceEscrow, issuer } = await deployFixture();
    await invoiceEscrow.connect(issuer).createInvoice(1, 0, ethers.ZeroAddress, "a");
    await invoiceEscrow.connect(issuer).createInvoice(2, 0, ethers.ZeroAddress, "b");

    const ids = await invoiceEscrow.getInvoicesByIssuer(issuer.address);
    expect(ids.map(Number)).to.deep.equal([0, 1]);
  });
});
