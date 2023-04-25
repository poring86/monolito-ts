import UseCaseInterface from "src/modules/shared/usecase/use-case.interface";
import PaymentFacadeInterface, {
  PaymentFacadeInputDto,
  PaymentFacadeOutputDto,
} from "./facade.interface";

export default class PaymentFacade implements PaymentFacadeInterface {
  constructor(private processPaymentUsecase: UseCaseInterface) {}
  process(input: PaymentFacadeInputDto): Promise<PaymentFacadeOutputDto> {
    return this.processPaymentUsecase.execute(input);
  }
}
