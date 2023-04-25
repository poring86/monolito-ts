import { Sequelize } from "sequelize-typescript";
import { InvoiceModel } from "./invoice.model";
import { Address } from "../domain/value-object/address.value-object";
import Product from "../domain/product.entity";
import Id from "../../../modules/shared/domain/value-object/id.value-object";
import { Invoice } from "../domain/invoice.entity";
import { InvoiceRepository } from "./invoice.repository";

describe("InvoiceRepository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([InvoiceModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should add an invoice", async () => {
    const address = new Address({
      street: "Street",
      number: "123",
      complement: "Complement",
      city: "City",
      state: "State",
      zipCode: "1223456",
    });

    const product1 = new Product({
      id: new Id("1"),
      name: "Product 1",
      price: 200,
    });

    const product2 = new Product({
      id: new Id("2"),
      name: "Product 2",
      price: 400,
    });

    const invoice = new Invoice({
      id: new Id("123"),
      name: "Invoice 1",
      document: "Document 1",
      items: [product1, product2],
      address: address,
    });

    const invoiceRepository = new InvoiceRepository();

    const result = await invoiceRepository.add(invoice);

    expect(result.id).toEqual(invoice.id);
    expect(result.name).toEqual(invoice.name);
    expect(result.document).toEqual(invoice.document);
    expect(result.items[0].name).toEqual(invoice.items[0].name);
    expect(result.items[1].name).toEqual(invoice.items[1].name);
    expect(result.items[1].price).toEqual(invoice.items[1].price);
    expect(result.items[1].id.id).toEqual(invoice.items[1].id);
    expect(result.address).toEqual(invoice.address);
    expect(invoice.total).toEqual(600);
    expect(result.total).toEqual(invoice.total);
  });

  it("should find an invoice", async () => {
    const invoiceCreated = await InvoiceModel.create({
      id: "321",
      name: "Invoice 2",
      document: "Document 2",
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: new Id("1"),
          name: "Product 1",
          price: 100,
        },
        {
          id: new Id("2"),
          name: "Product 2",
          price: 200,
        },
      ],
      addressStreet: "street",
      addressNumber: "number",
      addressComplement: "complement",
      addressCity: "city",
      addressState: "state",
      addressZipCode: "zipCode",
    });

    const invoiceRepository = new InvoiceRepository();

    const result = await invoiceRepository.find("321");

    expect(result.id.id).toEqual(invoiceCreated.id);
    expect(result.name).toEqual(invoiceCreated.name);
    expect(result.document).toEqual(invoiceCreated.document);
    expect(result.items[0].name).toEqual(invoiceCreated.items[0].name);
    expect(result.items[1].name).toEqual(invoiceCreated.items[1].name);
    expect(result.items[1].price).toEqual(invoiceCreated.items[1].price);
    expect(result.items[1].id.id).toEqual(invoiceCreated.items[1].id);
    expect(result.total).toEqual(300);
    expect(result.address).toEqual(
      new Address({
        street: invoiceCreated.addressStreet,
        number: invoiceCreated.addressNumber,
        complement: invoiceCreated.addressComplement,
        city: invoiceCreated.addressCity,
        state: invoiceCreated.addressState,
        zipCode: invoiceCreated.addressZipCode,
      })
    );
  });
});
