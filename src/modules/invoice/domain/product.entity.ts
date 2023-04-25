import BaseEntity from "../../../modules/shared/domain/entity/base.entity";
import AggregateRoot from "../../../modules/shared/domain/entity/aggregate-root.interface";
import Id from "../../shared/domain/value-object/id.value-object";

type ProductProps = {
  id?: Id;
  name: string;
  price: number;
};

export default class Product extends BaseEntity implements AggregateRoot {
  private _name: string;
  private _price: number;

  constructor(props: ProductProps) {
    super(props.id);
    this._name = props.name;
    this._price = props.price;
  }

  get name() {
    return this._name;
  }

  get price() {
    return this._price;
  }
}
