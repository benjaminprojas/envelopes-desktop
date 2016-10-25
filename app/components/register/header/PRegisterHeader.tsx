/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PHeaderAccountName } from './PHeaderAccountName';
import { PHeaderValue } from './PHeaderValue';

export interface PRegisterHeaderProps {
	accountName:string;
	clearedBalance:number;
	unclearedBalance:number;
	workingBalance:number;
	selectedTotal:number;
	showSelectedTotal:boolean;
	showReconcileButton:boolean;

	showReconcileAccountDialog:(element:HTMLElement)=>void;
}

const RegisterHeaderContainerStyle = {
	flex: '0 0 auto',
	height: '60px',
	width: '100%',
	backgroundColor: '#003540',
	paddingLeft: '0px',
	paddingRight: '5px'
}

const RegisterHeaderStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%',
	paddingRight: '5px'
}

const SymbolStyle = {
	color: '#588697',
	padding: '10px',
	fontSize: '16px',
	fontWeight: 'bold'
}

const ReconcileAccountButtonStyle = {
	width: '100px',
	color: '#009CC2',
	borderColor: '#009CC2',
	borderStyle: 'solid',
	backgroundColor: '#005164',
	borderWidth: '1px',
	borderRadius: '3px',
	outline: "none"
}

export class PRegisterHeader extends React.Component<PRegisterHeaderProps, {}> {
  
	private reconcileButton:HTMLButtonElement;

  	constructor(props: any) {
        super(props);
		this.onReconcileAccountClick = this.onReconcileAccountClick.bind(this);
    }

	private onReconcileAccountClick():void {
		this.props.showReconcileAccountDialog(this.reconcileButton);
	}

	private getHeaderContents():Array<JSX.Element> {

		var headerContents = [
			<PHeaderAccountName key="account_name" text={this.props.accountName} />,
			<PHeaderValue key="cleared_balance" label="Cleared Balance" value={this.props.clearedBalance} />,
			<text key="plus_symbol" style={SymbolStyle}>+</text>,
			<PHeaderValue key="uncleared_balance" label="Uncleared Balance" value={this.props.unclearedBalance} />,
			<text key="equal_symbol" style={SymbolStyle}>=</text>,
			<PHeaderValue key="working_balance" label="Working Balance" value={this.props.workingBalance} />
		];

		if(this.props.showSelectedTotal) {
			headerContents.push(<text key="separator_symbol" style={SymbolStyle}>|</text>);
			headerContents.push(<PHeaderValue key="selected_total" label="Selected Total" value={this.props.selectedTotal} />);
		}

		headerContents.push(<div key="spacer" className="spacer" />);
			
		if(this.props.showReconcileButton == true) {
			headerContents.push(
				<button key="reconcile_button" style={ReconcileAccountButtonStyle} 
					ref={(b)=> this.reconcileButton = b }
					onClick={this.onReconcileAccountClick}>
					Reconcile Account
				</button>
			);
		}

		return headerContents;
	}

	public render() {

		var headerContents = this.getHeaderContents();
		return (
			<div style={RegisterHeaderContainerStyle}>
				<div style={RegisterHeaderStyle}>
					{headerContents}
				</div>
			</div>
		);
  	}
}