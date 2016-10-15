/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';

import { PFlagSelector } from './PFlagSelector';
import { PAccountSelector } from './PAccountSelector';
import { PDateSelector } from './PDateSelector';
import { PPayeeSelector } from './PPayeeSelector';
import { PCategorySelector } from './PCategorySelector';
import { PMemoInput } from './PMemoInput';
import { PAmountInput } from './PAmountInput';

import * as objects from '../../../interfaces/objects';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { TransactionFlag, TransactionFrequency } from '../../../constants';
import { EntityFactory } from '../../../persistence';
import { IEntitiesCollection, ISimpleEntitiesCollection, ITransactionValues } from '../../../interfaces/state';
import { DialogUtilities, DateWithoutTime, FocusManager, KeyGenerator, Logger, SimpleObjectMap } from '../../../utilities';

export interface PTransactionDialogProps { 

	dialogTitle:string;
	// Entities collections from the global state 
	entitiesCollection:IEntitiesCollection;
	// Dispatch methods
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PTransactionDialogState {
	showModal: boolean;
	action: string; // new-transaction/existing-transaction/existing-scheduled-transaction 
	// If we are editing a transaction, it will be in the following two state variables
	transaction?: budgetEntities.ITransaction;
	subTransaction?: Array<budgetEntities.ISubTransaction>;
	// If we are editing a scheduled transaction, it will be in the following two state variables
	scheduledTransaction?: budgetEntities.IScheduledTransaction;
	scheduledSubTransaction?: Array<budgetEntities.IScheduledSubTransaction>;
	// This is for managing the focus in the dialog
	activeField:string;
	// Properties to save the values for the different fields. We wont create an actual transaction 
	// or scheduled transaction object until the user presses save.
	entityId?: string;
	accountId?: string;
	payeeId?: string;
	manuallyEnteredPayeeName?: string;
	date?: DateWithoutTime;
	frequency?: string;
	subCategoryId?: string;
	manuallyEnteredCategoryName?: string;
	memo?: string;
	inflowAmount?: number;
	outflowAmount?: number;
}

export class PTransactionDialog extends React.Component<PTransactionDialogProps, PTransactionDialogState> {

	private accountSelector:PAccountSelector;
	private dateSelector:PDateSelector;
	private payeeSelector:PPayeeSelector;
	private categorySelector:PCategorySelector;
	private memoInput:PMemoInput;
	private amountInput:PAmountInput;
	private saveAndAddAnotherButton:Button;
	private saveButton:Button;
	private cancelButton:Button;

	private accountsList:Array<objects.IAccountObject>;
	private payeesList:Array<objects.IPayeeObject>;
	private categoriesList:Array<objects.ICategoryObject>;
	private focusManager:FocusManager = new FocusManager(); 
	 
	constructor(props: any) {
        super(props);
		this.showForNewTransaction = this.showForNewTransaction.bind(this);
		this.showForExistingTransaction = this.showForExistingTransaction.bind(this);
		this.showForExistingScheduledTransaction = this.showForExistingScheduledTransaction.bind(this);
		this.save = this.save.bind(this);
		this.close = this.close.bind(this);
		this.onEntered = this.onEntered.bind(this);

		this.setActiveField = this.setActiveField.bind(this);
		this.setFocusOnAccountSelector = this.setFocusOnAccountSelector.bind(this);
		this.setFocusOnDateSelector = this.setFocusOnDateSelector.bind(this);
		this.setFocusOnPayeeSelector = this.setFocusOnPayeeSelector.bind(this);
		this.setFocusOnCategorySelector = this.setFocusOnCategorySelector.bind(this);
		this.setFocusOnMemoInput = this.setFocusOnMemoInput.bind(this);
		this.setFocusOnOutflowInput = this.setFocusOnOutflowInput.bind(this);
		this.setFocusOnInflowInput = this.setFocusOnInflowInput.bind(this);
		this.setFocusOnSaveAndAddAnotherButton = this.setFocusOnSaveAndAddAnotherButton.bind(this);
		this.setFocusOnSaveButton = this.setFocusOnSaveButton.bind(this);
		this.setFocusOnCancelButton = this.setFocusOnCancelButton.bind(this);
		this.handleTabPressedOnAccountSelector = this.handleTabPressedOnAccountSelector.bind(this);
		this.handleTabPressedOnDateSelector = this.handleTabPressedOnDateSelector.bind(this);
		this.handleTabPressedOnPayeeSelector = this.handleTabPressedOnPayeeSelector.bind(this);
		this.handleTabPressedOnCategorySelector = this.handleTabPressedOnCategorySelector.bind(this);
		this.handleTabPressedOnMemoInput = this.handleTabPressedOnMemoInput.bind(this);
		this.handleTabPressedOnOutflowInput = this.handleTabPressedOnOutflowInput.bind(this);
		this.handleTabPressedOnInflowInput = this.handleTabPressedOnInflowInput.bind(this);
		this.handleKeyPressedOnSaveAndAddAnotherButton = this.handleKeyPressedOnSaveAndAddAnotherButton.bind(this);
		this.handleKeyPressedOnSaveButton = this.handleKeyPressedOnSaveButton.bind(this);
		this.handleKeyPressedOnCancelButton = this.handleKeyPressedOnCancelButton.bind(this);

		this.setSelectedAccountId = this.setSelectedAccountId.bind(this);
		this.setSelectedDate = this.setSelectedDate.bind(this);
		this.setSelectedFrequency = this.setSelectedFrequency.bind(this);
		this.setSelectedPayeeId = this.setSelectedPayeeId.bind(this);
		this.setManuallyEnteredPayeeName = this.setManuallyEnteredPayeeName.bind(this);
		this.setSelectedCategoryId = this.setSelectedCategoryId.bind(this);
		this.setManuallyEnteredCategoryName = this.setManuallyEnteredCategoryName.bind(this);
		this.setMemo = this.setMemo.bind(this);
		this.setAmount = this.setAmount.bind(this);

        this.state = { showModal: false, action: null, activeField: null };

		this.focusManager.addFocusObject("account", this.setFocusOnAccountSelector);
		this.focusManager.addFocusObject("date", this.setFocusOnDateSelector);
		this.focusManager.addFocusObject("payee", this.setFocusOnPayeeSelector);
		this.focusManager.addFocusObject("category", this.setFocusOnCategorySelector);
		this.focusManager.addFocusObject("memo", this.setFocusOnMemoInput);
		this.focusManager.addFocusObject("outflow", this.setFocusOnOutflowInput);
		this.focusManager.addFocusObject("inflow", this.setFocusOnInflowInput);
		this.focusManager.addFocusObject("saveAndAddAnother", this.setFocusOnSaveAndAddAnotherButton);
		this.focusManager.addFocusObject("save", this.setFocusOnSaveButton);
		this.focusManager.addFocusObject("cancel", this.setFocusOnCancelButton);
    }

	public showForNewTransaction(accountId:string):void {

		// Before updating the state, refresh the lists of accounts, payees and categories 
		// for showing in the popovers of the transaction dialog.
		this.accountsList = DialogUtilities.buildAccountsList(this.props.entitiesCollection);
		this.payeesList = DialogUtilities.buildPayeesList(this.props.entitiesCollection);
		this.categoriesList = DialogUtilities.buildCategoriesList(this.props.entitiesCollection);

		// Update the state of this dialog to make it visible. 
		// Also reset all the fields for storing the values for the new transaction 
		// Note: We are not setting the activeField here, as it needs to be set in the "onEnter" handler
		// for the dialog box. This is so that we show the required popover when the dialog box has settled
		// into it's final position. 
		this.setState({ 
			showModal: true,
			action: "new-transaction",
			activeField: null,
			entityId: null,
			accountId: accountId,
			payeeId: null,
			manuallyEnteredPayeeName: null,
			date: DateWithoutTime.createForToday(),
			frequency: TransactionFrequency.Never,
			subCategoryId: null,
			manuallyEnteredCategoryName: null,
			memo: "",
			inflowAmount: 0,
			outflowAmount: 0
		});
	};

	public showForExistingTransaction(transaction:budgetEntities.ITransaction):void {

	}

	public showForExistingScheduledTransaction(scheduledTransaction:budgetEntities.IScheduledTransaction):void {

	}

	private setActiveField(activeField:string):void {

		if(activeField != this.state.activeField) {
			var state = Object.assign({}, this.state) as PTransactionDialogState;
			state.activeField = activeField;
			this.setState(state);
		}
	}

	private setFocusOnAccountSelector():void {
		this.setActiveField("account");
		this.accountSelector.setFocus();
	}

	private setFocusOnDateSelector():void {
		this.setActiveField("date");
		this.dateSelector.setFocus();
	}

	private setFocusOnPayeeSelector():void {
		this.setActiveField("payee");
		this.payeeSelector.setFocus();
	}

	private setFocusOnCategorySelector():void {
		this.setActiveField("category");
		this.categorySelector.setFocus();
	}

	private setFocusOnMemoInput():void {
		this.setActiveField("memo");
		this.memoInput.setFocus();
	}

	private setFocusOnOutflowInput():void {
		this.setActiveField("outflow");
		this.amountInput.setFocusOnOutflow();
	}

	private setFocusOnInflowInput():void {
		this.setActiveField("inflow");
		this.amountInput.setFocusOnInflow();
	}

	private setFocusOnSaveAndAddAnotherButton():void {
		this.setActiveField("saveAndAddAnother");
		(ReactDOM.findDOMNode(this.saveAndAddAnotherButton) as any).focus();
	}

	private setFocusOnSaveButton():void {
		this.setActiveField("save");
		(ReactDOM.findDOMNode(this.saveButton) as any).focus();
	}

	private setFocusOnCancelButton():void {
		this.setActiveField("cancel");
		(ReactDOM.findDOMNode(this.cancelButton) as any).focus();
	}

	private handleTabPressedOnAccountSelector(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("account");
		else
			this.focusManager.moveFocusBackward("account");
	}

	private handleTabPressedOnDateSelector(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("date");
		else
			this.focusManager.moveFocusBackward("date");
	}

	private handleTabPressedOnPayeeSelector(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("payee");
		else
			this.focusManager.moveFocusBackward("payee");
	}

	private handleTabPressedOnCategorySelector(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("category");
		else
			this.focusManager.moveFocusBackward("category");
	}

	private handleTabPressedOnMemoInput(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed) {
			// If the selected category is of inflow type, then move the focus by 2 steps to land on inflow
			var imediateIncomeSubCategory = this.props.entitiesCollection.subCategories.getImmediateIncomeSubCategory();
			if(this.state.subCategoryId && imediateIncomeSubCategory.entityId == this.state.subCategoryId)
				this.focusManager.moveFocusForward("memo", 2); // move 2 steps 
			else
				this.focusManager.moveFocusForward("memo");
		}
		else
			this.focusManager.moveFocusBackward("memo");
	}

	private handleTabPressedOnOutflowInput(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("outflow");
		else
			this.focusManager.moveFocusBackward("outflow");
	}

	private handleTabPressedOnInflowInput(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("inflow");
		else
			this.focusManager.moveFocusBackward("inflow");
	}

	private handleKeyPressedOnSaveAndAddAnotherButton(event:KeyboardEvent):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey)
				this.focusManager.moveFocusForward("saveAndAddAnother");
			else
				this.focusManager.moveFocusBackward("saveAndAddAnother");
		}
	}

	private handleKeyPressedOnSaveButton(event:KeyboardEvent):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey)
				this.focusManager.moveFocusForward("save");
			else
				this.focusManager.moveFocusBackward("save");
		}
	}

	private handleKeyPressedOnCancelButton(event:KeyboardEvent):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey)
				this.focusManager.moveFocusForward("cancel");
			else
				this.focusManager.moveFocusBackward("cancel");
		}
	}

	private saveTransaction():void {

		var entitiesCollection:ISimpleEntitiesCollection = {};

		if(this.state.frequency == TransactionFrequency.Never) {
			// Create the transaction entity and add it to the entitiesCollection 
			this.createNewTransaction(entitiesCollection);
		}
		else {
			// Create the scheduled transaction entity and add it to the entitiesCollection 
			this.createNewScheduledTransaction(entitiesCollection);
		}

		// Check if we need to create a new payee
		if(!this.state.payeeId && this.state.manuallyEnteredPayeeName) {
			// There is no selected pre-existing payee, but we do have a payee name manually
			// entered by the user in the payee input box. 
			// Create a new payee and save it in the entitiesCollection
			this.createNewPayee(entitiesCollection);

			var payee = entitiesCollection.payees[0];
			// Update the transaction/scheduled-transaction to point to this new payee 
			if(entitiesCollection.transactions && entitiesCollection.transactions.length > 0) {
				entitiesCollection.transactions[0].payeeId = payee.entityId;
			}
			else if(entitiesCollection.scheduledTransactions && entitiesCollection.scheduledTransactions.length > 0) {
				entitiesCollection.scheduledTransactions[0].payeeId = payee.entityId;
			}
		}

		// Call the passed updateEntities method in the props to save the entities
		this.props.updateEntities(entitiesCollection);
	}

	private saveAndAddAnother():void {

		if(this.validateTransaction()) {
			// Save the transaction
			this.saveTransaction();
			// Reset the state to start adding another transaction.
			// Keep the accountId to whatever was already set
			var state = Object.assign({}, this.state);
			state.activeField = "date";
			state.entityId = null;
			state.payeeId = null;
			state.manuallyEnteredPayeeName = null;
			state.date = DateWithoutTime.createForToday();
			state.frequency = TransactionFrequency.Never;
			state.subCategoryId = null;
			state.manuallyEnteredCategoryName = null;
			state.memo = null;
			state.inflowAmount = 0;
			state.outflowAmount = 0;
			this.setState(state);
		}
	}

	private save():void {

		if(this.validateTransaction()) {
			// Save the transaction
			this.saveTransaction();
			// Close the modal dialog
			this.close();
		}
	}

	private validateTransaction():boolean {

		// TODO: Add any required validation logic here
		return true;
	}

	private close():void {
		// Hide the modal, and set the account in state to null
		this.setState({ showModal: false, action: null, activeField: null });
	};

	private createNewTransaction(entitiesCollection:ISimpleEntitiesCollection):void {

		var transaction = EntityFactory.createNewTransaction();
		// Set the values in this transaction from the state
		transaction.accountId = this.state.accountId;
		transaction.date = this.state.date.getUTCTime();
		transaction.payeeId = this.state.payeeId;
		transaction.subCategoryId = this.state.subCategoryId;
		transaction.memo = this.state.memo;

		if(this.state.inflowAmount > 0)
			transaction.amount = this.state.inflowAmount;
		else if(this.state.outflowAmount > 0)
			transaction.amount = -this.state.outflowAmount;
		else
			transaction.amount = 0;

		// Add this transaction to the entities collection
		entitiesCollection.transactions = [transaction];
	}

	private createNewScheduledTransaction(entitiesCollection:ISimpleEntitiesCollection):void {

	}

	private createNewPayee(entitiesCollection:ISimpleEntitiesCollection):void {

		var payee = EntityFactory.createNewPayee();
		// Set the values in the payee from the state
		payee.name = this.state.manuallyEnteredPayeeName;
		payee.autoFillSubCategoryId = this.state.subCategoryId;
		// Add this payee to the entities collection
		entitiesCollection.payees = [payee];
	}

	private onEntered():void {
		var dateSelector = this.dateSelector;
		var setActiveField = this.setActiveField;
		setTimeout(function(){
			setActiveField("date");
			dateSelector.setFocus();
		}, 100);
	}

	private setSelectedAccountId(accountId:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.accountId = accountId;
		this.setState(state);
	}

	private setSelectedDate(date:DateWithoutTime):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.date = date;
		this.setState(state);
	}

	private setSelectedFrequency(frequency:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.frequency = frequency;
		this.setState(state);
	}

	private setSelectedPayeeId(payeeId:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.payeeId = payeeId;
		this.setState(state);
	}

	private setManuallyEnteredPayeeName(payeeName:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.manuallyEnteredPayeeName = payeeName;
		// When the user starts manually typing in a payeeName, clear the payeeId value
		state.payeeId = null;
		this.setState(state);
	}

	private setSelectedCategoryId(subCategoryId:string, clearManuallyEnteredCategoryName:boolean = false):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.subCategoryId = subCategoryId;
		if(clearManuallyEnteredCategoryName)
			state.manuallyEnteredCategoryName = null;
		this.setState(state);
	}

	private setManuallyEnteredCategoryName(categoryName:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.manuallyEnteredCategoryName = categoryName;
		// When the user starts manually typing in a categoryName, clear the categoryId value
		state.subCategoryId = null;
		this.setState(state);
	}

	private setMemo(memo:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.memo = memo;
		this.setState(state);
	}

	private setAmount(inflowAmount:number, outflowAmount:number):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.inflowAmount = inflowAmount;
		state.outflowAmount = outflowAmount;
		this.setState(state);
	}

	public render() {

		// Whatever the current selected account is, we need to remove it's corresponding payee from the payees list 
		var filteredPayeesList = _.filter(this.payeesList, (payeeObj:objects.IPayeeObject)=>{
			return (payeeObj.accountId != this.state.accountId);
		});

		var categoriesList = this.categoriesList;

		return (
			<Modal show={this.state.showModal} onEntered={this.onEntered} onHide={this.close} backdrop="static" keyboard={false} dialogClassName="add-transaction-dialog">
				<Modal.Header bsClass="modal-header">
					<Modal.Title>{this.props.dialogTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form horizontal>
						<PAccountSelector ref={(c) => this.accountSelector = c} 
							activeField={this.state.activeField} setActiveField={this.setActiveField}
							selectedAccountId={this.state.accountId} accountsList={this.accountsList} 
							setSelectedAccountId={this.setSelectedAccountId} handleTabPressed={this.handleTabPressedOnAccountSelector} />
						<PDateSelector ref={(c) => this.dateSelector = c} 
							activeField={this.state.activeField} setActiveField={this.setActiveField}
							selectedDate={this.state.date} selectedFrequency={this.state.frequency} setSelectedDate={this.setSelectedDate} 
							setSelectedFrequency={this.setSelectedFrequency} handleTabPressed={this.handleTabPressedOnDateSelector} />
						<PPayeeSelector ref={(c) => this.payeeSelector = c}
							activeField={this.state.activeField} setActiveField={this.setActiveField}
							selectedPayeeId={this.state.payeeId} manuallyEnteredPayeeName={this.state.manuallyEnteredPayeeName} 
							payeesList={filteredPayeesList} setSelectedPayeeId={this.setSelectedPayeeId} 
							setManuallyEnteredPayeeName={this.setManuallyEnteredPayeeName} handleTabPressed={this.handleTabPressedOnPayeeSelector} />
						<PCategorySelector ref={(c) => this.categorySelector = c} selectorLabel="Category"
							activeField={this.state.activeField} setActiveField={this.setActiveField}
							selectedCategoryId={this.state.subCategoryId} manuallyEnteredCategoryName={this.state.manuallyEnteredCategoryName} 
							categoriesList={categoriesList} setSelectedCategoryId={this.setSelectedCategoryId} 
							setManuallyEnteredCategoryName={this.setManuallyEnteredCategoryName} handleTabPressed={this.handleTabPressedOnCategorySelector} />
						<PMemoInput ref={(c) => this.memoInput = c} 
							activeField={this.state.activeField} setActiveField={this.setActiveField}
							memo={this.state.memo} setMemo={this.setMemo} handleTabPressed={this.handleTabPressedOnMemoInput} />
						<PAmountInput ref={(c) => this.amountInput = c} 
							activeField={this.state.activeField} setActiveField={this.setActiveField}
							inflowAmount={this.state.inflowAmount} outflowAmount={this.state.outflowAmount} 
							setAmount={this.setAmount} handleTabPressedOnOutflow={this.handleTabPressedOnOutflowInput} 
							handleTabPressedOnInflow={this.handleTabPressedOnInflowInput} />
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button ref={(c) => this.saveAndAddAnotherButton = c} className="dialog-primary-button"
						onClick={this.save} onKeyDown={this.handleKeyPressedOnSaveAndAddAnotherButton}>
						Save and add another&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
					<Button ref={(c) => this.saveButton = c} className="dialog-primary-button"
						onClick={this.save} onKeyDown={this.handleKeyPressedOnSaveButton}>
						Save&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
					<Button ref={(c) => this.cancelButton = c} className="dialog-secondary-button"
						onClick={this.close} onKeyDown={this.handleKeyPressedOnCancelButton}>
						Cancel&nbsp;<Glyphicon glyph="remove-sign" />
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
