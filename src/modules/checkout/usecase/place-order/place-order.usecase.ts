import UseCaseInterface from "../../../../modules/shared/usecase/use-case.interface";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "./place-order.dto";
import ClientAdmFacadeInterface from "../../../../modules/client-adm/facade/client-adm.facade.interface";
import ProductAdmFacadeInterface from "src/modules/product-adm/facade/product-adm.facade.interface";
import Product from "../../domain/product.entity";
import StoreCatalogFacadeInterface from "../../../../modules/store-catalog/facade/store-catalog.facade.interface";
import Id from "../../../../modules/shared/domain/value-object/id.value-object";
import Client from "../../domain/client.entity";
import Order from "../../domain/order.entity";
import CheckoutGateway from "../../gateway/checkout.gateway";
import PaymentFacadeInterface from "../../../../modules/payment/facade/facade.interface";
import { InvoiceFacadeInterface } from "../../../../modules/invoice/facade/invoice.facade.interface";

export default class PlaceOrderUseCase implements UseCaseInterface {
  private _clientFacade: ClientAdmFacadeInterface;
  private _productFacade: ProductAdmFacadeInterface;
  private _catalogFacade: StoreCatalogFacadeInterface;
  private _repository: CheckoutGateway;
  private _invoiceFacade: InvoiceFacadeInterface;
  private _paymentFacade: PaymentFacadeInterface;
  constructor(
    clientFacade: ClientAdmFacadeInterface,
    productFacade: ProductAdmFacadeInterface,
    catalogFacade: StoreCatalogFacadeInterface,
    paymentFacade: PaymentFacadeInterface,
    invoiceFacade: InvoiceFacadeInterface,
    repository: CheckoutGateway
  ) {
    this._clientFacade = clientFacade;
    this._productFacade = productFacade;
    this._catalogFacade = catalogFacade;
    this._paymentFacade = paymentFacade;
    this._invoiceFacade = invoiceFacade;
    this._repository = repository;
  }

  async execute(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {
    const client = await this._clientFacade.find({ id: input.clientId });

    if (!client) {
      throw new Error("Client not found");
    }

    await this.validateProducts(input);

    const products = await Promise.all(
      input.products.map((p) => this.getProduct(p.productId))
    );

    const orderClient = new Client({
      id: new Id(client.id),
      name: client.name,
      email: client.email,
      document: client.document,
      street: client.street,
      number: client.number,
      complement: client.complement,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
    });

    const order = new Order({
      client: orderClient,
      products: products,
    });

    const payment = await this._paymentFacade.process({
      orderId: order.id.id,
      amount: order.total,
    });

    const invoice =
      payment.status === "approved"
        ? await this._invoiceFacade.generateInvoice({
            name: client.name,
            document: client.document,
            street: client.street,
            complement: client.complement,
            number: client.number,
            city: client.city,
            state: client.state,
            zipCode: client.zipCode,
            items: products.map((p) => ({
              id: p.id.id,
              name: p.name,
              price: p.salesPrice,
            })),
          })
        : null;

    payment.status === "approved" && order.approved();
    const invoiceId = payment.status === "approved" ? invoice.id : null;

    this._repository.addOrder(order);

    return {
      id: order.id.id,
      invoiceId,
      status: order.status,
      total: order.total,
      products: products.map((p) => ({ productId: p.id.id })),
    };
  }

  private async validateProducts(input: PlaceOrderInputDto): Promise<void> {
    if (input.products.length === 0) {
      throw new Error("No products selected");
    }

    for (const p of input.products) {
      const product = await this._productFacade.checkStock({
        productId: p.productId,
      });
      if (product.stock <= 0) {
        throw new Error(
          `Product ${product.productId} is not available in stock`
        );
      }
    }
  }

  private async getProduct(productId: string): Promise<Product> {
    const product = await this._catalogFacade.find({ id: productId });
    if (!product) {
      throw new Error("Product not found");
    }

    const productProps = {
      id: new Id(product.id),
      name: product.name,
      description: product.description,
      salesPrice: product.salesPrice,
    };

    return new Product(productProps);
  }
}
