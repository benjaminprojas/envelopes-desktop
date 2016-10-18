/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';

import { RegisterTransactionObject, SimpleObjectMap } from '../../../utilities';
import { RegisterTransactionObjectsArray } from '../../../collections';

export interface PPayeeCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	registerTransactionObjects:RegisterTransactionObjectsArray;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(registerTransactionObject:RegisterTransactionObject, focusOnField:string)=>void;
	selectTransaction:(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean)=>void;
}

export class PPayeeCell extends React.Component<PPayeeCellProps, {}> {
	
	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
	}

	private onClick(event:MouseEvent):void {

		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		this.props.selectTransaction(registerTransactionObject, true);
	}	

	private onDoubleClick(event:MouseEvent):void {

		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		this.props.editTransaction(registerTransactionObject, "payee");
	}

	public render() {

		if(!this.props.registerTransactionObjects)
			return <div />;

		// Get the transaction for the current row
		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		// Check whether this is currently selected or not
		var selected:boolean = registerTransactionObject.isSelected(this.props.selectedTransactionsMap);
		// CSS class name based on whether we are selected or not
		var className = selected ? "register-transaction-cell-selected" : "register-transaction-cell";

		return (
			<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>{registerTransactionObject.payeeName}</div>
		);
  	}
}