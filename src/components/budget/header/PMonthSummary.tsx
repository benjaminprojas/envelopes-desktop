/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { UIConstants } from '../../../constants';
import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PMonthSummaryProps {
	dataFormatter:DataFormatter;
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
}

const MonthSummaryContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	display: 'flex',
	flexFlow: 'row nowrap',
	alignItems: 'center',
	justifyContent: "center",
	backgroundColor: 'transparent',
	paddingLeft: '5px',
	paddingRight: '5px',
	width: UIConstants.MonthlyDataColumnsWidth,
	height: "100%"
}

const SummaryNumbersContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'flex-end',
	paddingLeft: '10px',
	paddingRight: '5px'
}

const SummaryNumberStyle:React.CSSProperties = {
	color: '#ffffff',
	fontSize: '12px',
	fontWeight: 'bold',
	margin: '0px'
}

const SummaryLabelsContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'flex-start'
}

const SummaryLabelStyle:React.CSSProperties = {
	color: '#ffffff',
	fontSize: '12px',
	fontWeight: 'normal',
	fontStyle: 'italic',
	margin: '0px'
}

export class PMonthSummary extends React.Component<PMonthSummaryProps, {}> {

	public render() {

		var entitiesCollection = this.props.entitiesCollection;
		if(entitiesCollection && entitiesCollection.monthlyBudgets && entitiesCollection.monthlyBudgets.length > 0) {

			var dataFormatter = this.props.dataFormatter;
			var currentMonth = this.props.currentMonth;
			var prevMonth = currentMonth.clone().subtractMonths(1);
			var currentMonthName = currentMonth.format("MMM");
			var prevMonthName = prevMonth.format("MMM");
			var monthlyBudgetsArray = entitiesCollection.monthlyBudgets;

			var monthlyBudgetForCurrentMonth = monthlyBudgetsArray.getMonthlyBudgetByMonth(currentMonth.toISOString());
			var currentMonthImmediateIncome = monthlyBudgetForCurrentMonth ? monthlyBudgetForCurrentMonth.immediateIncome : 0;
			var currentMonthAdditionalToBeBudgeted = monthlyBudgetForCurrentMonth ? monthlyBudgetForCurrentMonth.additionalToBeBudgeted : 0;

			var monthlyBudgetForPrevMonth = monthlyBudgetsArray.getMonthlyBudgetByMonth(prevMonth.toISOString());
			var previousMonthAvailableToBudget = monthlyBudgetForPrevMonth ? monthlyBudgetForPrevMonth.availableToBudget : 0;

			// Calculate the values to display in the summary
			var fundsForCurrentMonth = previousMonthAvailableToBudget + currentMonthImmediateIncome + currentMonthAdditionalToBeBudgeted;
			var overspentInPrevMonth = monthlyBudgetForPrevMonth ? monthlyBudgetForPrevMonth.overSpent : 0;
			var budgetedInCurrentMonth = monthlyBudgetForCurrentMonth ? monthlyBudgetForCurrentMonth.budgeted : 0;
			var budgetedInFuture = monthlyBudgetsArray.getBudgetedInFutureForMonth(currentMonth);

			return (
				<div style={MonthSummaryContainerStyle}>
					<div style={SummaryNumbersContainerStyle}>
						<label style={SummaryNumberStyle}>{dataFormatter.formatCurrency(fundsForCurrentMonth)}</label>
						<label style={SummaryNumberStyle}>{dataFormatter.formatCurrency(overspentInPrevMonth)}</label>
						<label style={SummaryNumberStyle}>{dataFormatter.formatCurrency(-budgetedInCurrentMonth)}</label>
						<label style={SummaryNumberStyle}>{dataFormatter.formatCurrency(-budgetedInFuture)}</label>
					</div>
					<div style={SummaryLabelsContainerStyle}>
						<label style={SummaryLabelStyle}>Funds for {currentMonthName}</label>
						<label style={SummaryLabelStyle}>Overspent in {prevMonthName}</label>
						<label style={SummaryLabelStyle}>Budgeted in {currentMonthName}</label>
						<label style={SummaryLabelStyle}>Budgeted in Future</label>
					</div>
				</div>
			);
		}
		else 
			return <div/>;
	}
}