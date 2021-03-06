import Component from "../Component";
import { Button, Input, Label, Select } from "../common";
import ModalConfirm from "../Modal/ModalConfirm";
import {
  AmountModel,
  CategoryModel,
  SelectedCategoryModel,
  ClassificationModel,
  EditFlagModel,
  DateModel,
  DetailModel,
  PaymentMethodModel,
  SelectedPaymentMethodModel,
  TypeClassificaion,
  SelectOption,
} from "../../models/HistoryModel";
import { SelectedHistoryModel } from "../../models/HistoryModel/HistoryList";
import LoginModel from "../../models/LoginModel";
import RootModel from "../../models/RootModel";
import fetch from "../../fetch/";
import "./InputForm.scss";

interface History {
  income: boolean;
  year: number;
  month: number;
  day: number;
  category: string;
  paymentMethod: string;
  amount: number;
  detail: string;
}

class InputForm extends Component {
  rootModel = RootModel;
  selectedHistoryModel = SelectedHistoryModel;

  classificationModel = ClassificationModel;
  editFlagModel = EditFlagModel;
  dateModel = DateModel;
  categoryModel = CategoryModel;
  selectedCategoryModel = SelectedCategoryModel;
  paymentMethodModel = PaymentMethodModel;
  selectedPaymentMethodModel = SelectedPaymentMethodModel;
  amountModel = AmountModel;
  detailModel = DetailModel;

  buttonIncome: Button | null = null;
  buttonOutcome: Button | null = null;
  buttonReset: Button | null = null;
  buttonDelete: Button | null = null;
  inputDate: Input | null = null;
  selectCategory: Select | null = null;
  selectPaymentMethod: Select | null = null;
  inputAmount: Input | null = null;
  inputDetail: Input | null = null;
  buttonSubmit: Button | null = null;

  validationMap: Map<Component, boolean> = new Map();

  constructor() {
    super("div", { classes: ["input-form"] });

    this.render();

    this.subscribeModels();
    this.initDatas();

    this.initValidationMap();
    this.checkAllInputsValidation();
  }

  initValidationMap() {
    if (this.inputDate) {
      this.validationMap.set(this.inputDate, true);
    }
    if (this.selectCategory) {
      this.validationMap.set(this.selectCategory, false);
    }
    if (this.selectPaymentMethod) {
      this.validationMap.set(this.selectPaymentMethod, false);
    }
    if (this.inputAmount) {
      this.validationMap.set(this.inputAmount, false);
    }
    if (this.inputDetail) {
      this.validationMap.set(this.inputDetail, false);
    }
  }

  areAllInputsValid(): boolean {
    let valid = true;
    this.validationMap.forEach((value) => {
      if (!value) {
        valid = false;
      }
    });
    return valid;
  }

  checkAllInputsValidation() {
    if (this.areAllInputsValid()) {
      (<HTMLButtonElement>this.buttonSubmit?.view).disabled = false;
      (<HTMLButtonElement>this.buttonSubmit?.view).classList.remove(
        "button-disabled"
      );
    } else {
      (<HTMLButtonElement>this.buttonSubmit?.view).disabled = true;
      (<HTMLButtonElement>this.buttonSubmit?.view).classList.add(
        "button-disabled"
      );
    }
  }

  resetInputs() {
    // 확인버튼을 위한 유효성 검사 초기화
    this.validationMap.forEach((_, key) => {
      this.validationMap.set(key, false);
    });

    // 분류 초기화
    this.classificationModel.setClassifiacation("outcome");

    // 날짜 초기화
    this.dateModel.setDate(new Date(Date.now()));

    // 카테고리 초가화
    (<HTMLSelectElement>this.selectCategory?.view).selectedIndex = 0;

    // 결제수단 초기화
    (<HTMLSelectElement>this.selectPaymentMethod?.view).selectedIndex = 0;

    // 금액 초기화
    (<HTMLInputElement>this.inputAmount?.view).value = "원";

    // 내용 초기화
    (<HTMLInputElement>this.inputDetail?.view).value = "";

    this.editFlagModel.setEditMode(false);
    this.checkAllInputsValidation();
  }

  setButtonIncomePrimary() {
    this.buttonIncome?.view.classList.remove("button-secondary");
    this.buttonIncome?.view.classList.add("button-primary");
    this.buttonOutcome?.view.classList.remove("button-primary");
    this.buttonOutcome?.view.classList.add("button-secondary");
  }

  setButtonOutcomePrimary() {
    this.buttonOutcome?.view.classList.remove("button-secondary");
    this.buttonOutcome?.view.classList.add("button-primary");
    this.buttonIncome?.view.classList.remove("button-primary");
    this.buttonIncome?.view.classList.add("button-secondary");
  }

  fetchPostHistory(history: History) {
    const { year, month } = history;
    const userId = LoginModel.getLoggedInUserId();
    fetch.postHistory(userId, history).then((response) => {
      this.rootModel.setDate({ year, month });
    });
  }

  fetchPutHistory(history: History) {
    const { year, month } = history;
    const userId = LoginModel.getLoggedInUserId();
    fetch.putHistory(userId, history).then((response) => {
      this.rootModel.setDate({ year, month });
    });
  }

  handleButtonSubmitClicked() {
    const id = this.selectedHistoryModel.getSelectedHistoryId();

    // 수입, 지출 여부 가져오기
    const income = this.classificationModel.getClassification() === "income";

    // 날짜 가져오기
    const date = this.dateModel.getDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // 카테고리 가져오기
    const category = this.selectedCategoryModel
      .getSelectedCategory()
      .id!.toString();

    // 결제수단 가져오기
    const paymentMethod = this.selectedPaymentMethodModel.getSelectedPaymentMethod()
      .textContent;

    // 금액 가져오기
    const amount = this.amountModel.getAmount();

    // 내용 가져오기
    const detail = this.detailModel.getDetail();

    const history = {
      id,
      income,
      year,
      month,
      day,
      category,
      paymentMethod,
      amount,
      detail,
    };

    const isEditMode = this.editFlagModel.getEditMode();
    if (isEditMode) {
      this.fetchPutHistory(history);
    } else {
      this.fetchPostHistory(history);
    }
    this.resetInputs();
  }

  subscribeModels() {
    this.classificationModel.subscribe(
      "subClassification",
      (classification: TypeClassificaion) => {
        switch (classification) {
          case "income":
            this.setButtonIncomePrimary();
            break;
          case "outcome":
            this.setButtonOutcomePrimary();
            break;
          default:
            break;
        }
      }
    );

    this.editFlagModel.subscribe(
      "subEditFlagInInputForm",
      (isEditMode: boolean) => {
        const buttonResetView = <HTMLButtonElement>this.buttonReset?.view;
        const buttonDeleteView = <HTMLButtonElement>this.buttonDelete?.view;

        if (isEditMode) {
          buttonResetView.classList.add("button-hidden");
          buttonDeleteView.classList.remove("button-hidden");
        } else {
          buttonResetView.classList.remove("button-hidden");
          buttonDeleteView.classList.add("button-hidden");
        }
      }
    );

    this.dateModel.subscribe("subDate", (date: Date) => {
      (<HTMLInputElement>this.inputDate?.view).value = date
        .toISOString()
        .split("T")[0];

      this.validationMap.set(this.inputDate!, true);
      this.checkAllInputsValidation();
    });

    this.categoryModel.subscribe(
      "subCategory",
      (categoryOptions: SelectOption[]) => {
        this.selectCategory?.setSelectOption({
          selectOptions: [
            {
              textContent: "선택하세요",
              value: "none",
              disabled: true,
              selected: true,
            },
            ...categoryOptions,
          ],
        });

        // 카테고리 유효성 검사 다시함
        this.validationMap.set(this.selectCategory!, false);
        this.checkAllInputsValidation();
      }
    );

    this.selectedCategoryModel.subscribe(
      "subSelectedCategoryInInputForm",
      (selectedCategory: SelectOption) => {
        (<HTMLSelectElement>this.selectCategory?.view).selectedIndex = parseInt(
          selectedCategory.value
        );

        // 유효성 검사
        this.validationMap.set(this.selectCategory!, true);
        this.checkAllInputsValidation();
      }
    );

    this.paymentMethodModel.subscribe(
      "subPaymentMethod",
      (paymentMethodOptions: SelectOption[]) => {
        this.selectPaymentMethod?.setSelectOption({
          selectOptions: [
            {
              textContent: "선택하세요",
              value: "none",
              disabled: true,
              selected: true,
            },
            ...paymentMethodOptions,
          ],
        });
      }
    );
    this.selectedPaymentMethodModel.subscribe(
      "subSelectedPaymentMethodInInputForm",
      (selectedPaymentMethod: SelectOption) => {
        (<HTMLSelectElement>(
          this.selectPaymentMethod?.view
        )).selectedIndex = parseInt(selectedPaymentMethod.value);

        this.validationMap.set(this.selectPaymentMethod!, true);
        this.checkAllInputsValidation();
      }
    );

    this.amountModel.subscribe("subAmountInInputForm", (amount: number) => {
      // 금액 입력창에 콤마, 원 붙여주기
      const inputAmountView = <HTMLInputElement>this.inputAmount?.view;
      const flag = amount > 0;
      inputAmountView.value = `${flag ? amount.toLocaleString() : ""}원`;

      this.setAmountInputCursorBeforeWon();

      this.validationMap.set(this.inputAmount!, flag);
      this.checkAllInputsValidation();
    });

    this.detailModel.subscribe("subDetailInInputForm", (detail: string) => {
      (<HTMLInputElement>this.inputDetail?.view).value = detail;

      this.validationMap.set(this.inputDetail!, detail.length > 0);
      this.checkAllInputsValidation();
    });
  }

  // 커서를 '원' 이전에 놓기
  setAmountInputCursorBeforeWon() {
    const inputAmountView = <HTMLInputElement>this.inputAmount?.view;
    inputAmountView.selectionStart = inputAmountView.value.length - 1;
    inputAmountView.selectionEnd = inputAmountView.value.length - 1;
  }

  initDatas() {
    this.classificationModel.initData();
    this.dateModel.initData();
    this.categoryModel.initData();
    this.amountModel.initData();
  }

  render() {
    const divRow1 = new Component("div", { classes: ["history-row"] });

    const spanClassification = new Component("span", {
      id: "classification",
      classes: ["classification"],
    });
    const labelClassification = new Label({
      id: "label-classification",
      classes: ["label-classification"],
      textContent: "분류",
    });
    this.buttonIncome = new Button({
      id: "button-income",
      classes: ["button", "button-secondary"],
      textContent: "수입",
      eventListeners: [
        {
          type: "click",
          listener: (event) => {
            event.preventDefault();
            this.classificationModel.setClassifiacation("income");
          },
        },
      ],
    });
    this.buttonOutcome = new Button({
      id: "button-outcome",
      classes: ["button", "button-primary"],
      textContent: "지출",
      eventListeners: [
        {
          type: "click",
          listener: (event) => {
            event.preventDefault();
            this.classificationModel.setClassifiacation("outcome");
          },
        },
      ],
    });

    this.buttonReset = new Button({
      id: "button-reset",
      classes: ["button-reset"],
      textContent: "내용 지우기",
      eventListeners: [
        {
          type: "click",
          listener: (event) => {
            this.resetInputs();
          },
        },
      ],
    });
    this.buttonDelete = new Button({
      id: "button-delete",
      classes: ["button-reset", "button-hidden"],
      textContent: "삭제",
      eventListeners: [
        {
          type: "click",
          listener: (event) => {
            new ModalConfirm(() => {
              const selectedHistoryId = this.selectedHistoryModel.getSelectedHistoryId();
              fetch.deleteHistory(selectedHistoryId).then((response) => {
                const date = this.dateModel.getDate();
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                this.rootModel.setDate({ year, month });
                this.resetInputs();
              });
            });
          },
        },
      ],
    });

    const divRow2 = new Component("div", { classes: ["history-row"] });

    const labelDate = new Label({
      id: "label-date",
      classes: ["label-date"],
      textContent: "날짜",
    });
    this.inputDate = new Input({
      type: "date",
      id: "input-date",
      classes: ["input-date", "input-select-common"],
      eventListeners: [
        {
          type: "change",
          listener: (event: Event) => {
            const dateString = (<HTMLInputElement>event.currentTarget).value;
            if (dateString) {
              this.dateModel.setDate(new Date(dateString));
            }
          },
        },
      ],
    });

    const labelCategory = new Label({
      id: "label-category",
      classes: ["label-category"],
      textContent: "카테고리",
    });
    this.selectCategory = new Select({
      id: "select-category",
      classes: ["select-category", "input-select-common"],
      selectOptions: [
        {
          textContent: "선택하세요",
          value: "none",
          disabled: true,
          selected: true,
        },
      ],
      eventListeners: [
        {
          type: "change",
          listener: (event) => {
            const target = <HTMLSelectElement>event.currentTarget;
            const idx = target.selectedIndex;
            const textContent = target[idx].textContent || "";
            const value = target[idx].getAttribute("value") || "";
            const income = this.classificationModel.getClassification();
            const id = this.categoryModel.getIdFromTextContent(
              income,
              textContent
            );
            this.selectedCategoryModel.setSelectedCategory({
              id,
              textContent,
              value,
            });

            // 인풋 체크
            // 선택한 index가 0보다 큼 === '선택하세요'가 아님
            const flag =
              (<HTMLSelectElement>this.selectCategory?.view).selectedIndex > 0;

            this.validationMap.set(this.selectCategory!, flag);
            this.checkAllInputsValidation();
          },
        },
      ],
    });

    const labelPaymentMethod = new Label({
      id: "label-payment-method",
      classes: ["label-payment-method"],
      textContent: "결제수단",
    });
    this.selectPaymentMethod = new Select({
      id: "select-payment-method",
      classes: ["select-payment-method", "input-select-common"],
      selectOptions: [
        {
          textContent: "선택하세요",
          value: "none",
          disabled: true,
          selected: true,
        },
      ],
      eventListeners: [
        {
          type: "change",
          listener: (event) => {
            const target = <HTMLSelectElement>event.currentTarget;
            const idx = target.selectedIndex;
            const textContent = target[idx].textContent || "";
            const value = target[idx].getAttribute("value") || "";
            this.selectedPaymentMethodModel.setSelectedPaymentMethod({
              textContent,
              value,
            });

            // 인풋 체크
            // 선택한 index가 0보다 큼 === '선택하세요'가 아님
            const flag =
              (<HTMLSelectElement>this.selectPaymentMethod?.view)
                .selectedIndex > 0;

            this.validationMap.set(this.selectPaymentMethod!, flag);
            this.checkAllInputsValidation();
          },
        },
      ],
    });

    const divRow3 = new Component("div", { classes: ["history-row"] });

    const labelAmount = new Label({
      id: "label-amount",
      classes: ["label-amount"],
      textContent: "금액",
    });
    this.inputAmount = new Input({
      id: "input-amount",
      classes: ["input-amount", "input-select-common"],
      eventListeners: [
        {
          type: "keyup",
          listener: (event) => {
            const value = (<HTMLInputElement>event.currentTarget).value;

            // comma 제거
            const commaRemoved = value.replace(/[^0-9]/g, "");
            let amount = 0;
            if (commaRemoved) {
              amount = parseInt(commaRemoved);
            }

            this.amountModel.setAmount(amount);

            // 인풋 체크
            const flag = amount > 0;
            this.validationMap.set(this.inputAmount!, flag);

            this.checkAllInputsValidation();
          },
        },
        {
          type: "click",
          listener: (event) => {
            this.setAmountInputCursorBeforeWon();
          },
        },
      ],
    });
    const labelDetail = new Label({
      id: "label-detail",
      classes: ["label-detail"],
      textContent: "내용",
    });
    this.inputDetail = new Input({
      id: "input-detail",
      classes: ["input-detail", "input-select-common"],
      eventListeners: [
        {
          type: "keyup",
          listener: (event) => {
            const value = (<HTMLInputElement>event.currentTarget).value;
            this.detailModel.setDetail(value);

            // 인풋 체크
            const flag = value.length > 0;

            this.validationMap.set(this.inputDetail!, flag);
            this.checkAllInputsValidation();
          },
        },
      ],
    });
    this.buttonSubmit = new Button({
      id: "button-form-submit",
      classes: ["button", "button-primary", "button-form-submit"],
      textContent: "확인",
      eventListeners: [
        {
          type: "click",
          listener: () => {
            this.handleButtonSubmitClicked();
          },
        },
      ],
    });

    this.appendChildren([
      divRow1.appendChildren([
        spanClassification.appendChildren([
          labelClassification,
          this.buttonIncome,
          this.buttonOutcome,
        ]),
        this.buttonReset,
        this.buttonDelete,
      ]),
      divRow2.appendChildren([
        new Component("span", { classes: ["row-flex"] }).appendChildren([
          labelDate,
          this.inputDate,
        ]),
        new Component("span", { classes: ["row-flex"] }).appendChildren([
          labelCategory,
          this.selectCategory,
        ]),
        new Component("span", { classes: ["row-flex"] }).appendChildren([
          labelPaymentMethod,
          this.selectPaymentMethod,
        ]),
      ]),
      divRow3.appendChildren([
        new Component("span", { classes: ["row-flex"] }).appendChildren([
          labelAmount,
          this.inputAmount,
        ]),
        new Component("span", { classes: ["row-flex"] }).appendChildren([
          labelDetail,
          this.inputDetail,
        ]),
      ]),
      this.buttonSubmit,
    ]);
  }
}

export default InputForm;
