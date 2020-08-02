import CategoryModel from "./InputForm/CategoryModel";
import ClassificationModel, {
  TypeClassificaion,
} from "./InputForm/ClassificationModel";
import DateModel from "./InputForm/DateModel";
import PaymentMethodModel from "./InputForm/PaymentMethodModel";
interface SelectOption {
  textContent: string;
  value: string;
  disabled?: boolean;
  selected?: boolean;
}

export { TypeClassificaion, SelectOption };
export {
  CategoryModel,
  ClassificationModel,
  DateModel,
  PaymentMethodModel,
};
