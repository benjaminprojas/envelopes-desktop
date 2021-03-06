/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';

import { DataFormatter, RegisterTransactionObject, SimpleObjectMap } from '../../../utilities';
import { RegisterTransactionObjectsArray } from '../../../collections';

export interface PInflowCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	dataFormatter:DataFormatter;
	registerTransactionObjects:RegisterTransactionObjectsArray;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(registerTransactionObject:RegisterTransactionObject, focusOnField:string)=>void;
	selectTransaction:(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean)=>void;
}

export class PInflowCell extends React.Component<PInflowCellProps, {}> {
	
	constructor(props:PInflowCellProps) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
	}

	private onClick(event:React.MouseEvent<any>):void {

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		this.props.selectTransaction(registerTransactionObject, true);
	}	

	private onDoubleClick(event:React.MouseEvent<any>):void {

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		this.props.editTransaction(registerTransactionObject, "inflow");
	}

	public render() {

		if(!this.props.registerTransactionObjects)
			return <div />;

		// Get the transaction for the current row
		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		var className:string = registerTransactionObject.getCSSClassName(this.props.selectedTransactionsMap);
		var formattedValue = "";
		if(registerTransactionObject.inflow != 0)
			formattedValue = this.props.dataFormatter.formatCurrency(registerTransactionObject.inflow);

		return (
			<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>{formattedValue}</div>
		);
  	}
}