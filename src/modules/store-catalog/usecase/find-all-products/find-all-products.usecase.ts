import UseCaseInterface from "../../../../modules/shared/usecase/use-case.interface";
import ProductGateway from "../../gateway/product.gateway";

export default class FindAllProductsUsecase implements UseCaseInterface {
  constructor(private productRepository: ProductGateway) {}
  async execute(): Promise<any> {
    const product = await this.productRepository.findAll();
    return {
      products: product.map((product) => ({
        id: product.id.id,
        name: product.name,
        description: product.description,
        salesPrice: product.salesPrice,
      })),
    };
  }
}
