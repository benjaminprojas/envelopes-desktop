/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';

import { PFlagSelector } from './PFlagSelector';
import { PAccountSelector } from './PAccountSelector';
import { PDateSelector } from './PDateSelector';
import { PPayeeSelector } from './PPayeeSelector';

import * as utilities from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection } from '../../../interfaces/state';

const PAddTransactionDialogStyle = {
	position: 'absolute',
	left: '50%',
	marginLeft: '-500px',
	top: '50%',
	marginTop: '-300px'
}

export interface PAddTransactionDialogProps { 
	// Collections needed to fill the drop downs in the dialog
	accounts: Array<budgetEntities.IAccount>;
	payees: Array<budgetEntities.IPayee>;
	masterCategories: Array<budgetEntities.IMasterCategory>;
	subCategories: Array<budgetEntities.ISubCategory>;
	// Dispatch methods
	updateEntities:(entities:IEntitiesCollection)=>void;
}

export interface PAddTransactionDialogState {
	showModal: boolean;
	// Fields to save the values for the different fields.
	entityId?:string;
	flag?:string;
	accountId?:string;
	payeeId?:string;
	date?:utilities.DateWithoutTime;
	frequency?:string;
	subCategoryId?:string;
	memo?:string;
	amount?:number;
	cleared?:string;
}

export class PAddTransactionDialog extends React.Component<PAddTransactionDialogProps, PAddTransactionDialogState> {

	private ctrlAccountName:FormControl;
	private ctrlAccountType:FormControl;
	private ctrlAccountBalance:FormControl;

	private dummyAccounts = [
		{ entityId: 1, accountName: "Checking" },
		{ entityId: 2, accountName: "Savings" },
		{ entityId: 3, accountName: "Visa" },
		{ entityId: 4, accountName: "Master" }
	];

	private dummyPayees = [
		{ entityId: 1, name: "Transfer: Checking", accountId: 1 },
		{ entityId: 2, name: "Transfer: Savings", accountId: 2 },
		{ entityId: 3, name: "Transfer: Visa", accountId: 3 },
		{ entityId: 4, name: "Transfer: Master", accountId: 4 },
		{ entityId: 5, name: "HTH Store", accountId: null },
		{ entityId: 6, name: "Rockland Bakery", accountId: null },
		{ entityId: 7, name: "Prince Departmental Store", accountId: null },
		{ entityId: 8, name: "E-Mart", accountId: null }
	];

	constructor(props: any) {
        super(props);
        this.state = { showModal: false };
		this.show = this.show.bind(this);
		this.save = this.save.bind(this);
		this.close = this.close.bind(this);
    }

	private close():void {
		// Hide the modal, and set the account in state to null
		this.setState({ showModal: false });
	};

	private save():void {

		// Close the modal dialog
		this.close();
	}

	private saveAndAddAnother():void {

	}

	public show():void {

		this.setState({ showModal: true });
	};

	public render() {
		return (
			<Modal show={this.state.showModal} onHide={this.close} backdrop="static" keyboard={false} dialogClassName="add-transaction-dialog" style={PAddTransactionDialogStyle}>
				<Modal.Header bsClass="modal-header">
					<Modal.Title>Add Transaction</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<FormGroup>
							<PFlagSelector width={30} />
						</FormGroup>
						<FormGroup>
							<ControlLabel>ACCOUNT:</ControlLabel>
							<PAccountSelector width={90} accounts={this.dummyAccounts as Array<any>} />
						</FormGroup>
						<FormGroup>
							<ControlLabel>DATE:</ControlLabel>
							<PDateSelector width={90} />
						</FormGroup>
						<FormGroup>
							<ControlLabel>PAYEE:</ControlLabel>
							<PPayeeSelector width={90} payees={this.dummyPayees as Array<any>} />
						</FormGroup>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.close}>
						Cancel&nbsp;<Glyphicon glyph="remove-sign" />
					</Button>
					<Button onClick={this.save}>
						Save and add another&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
					<Button onClick={this.save}>
						Save&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}