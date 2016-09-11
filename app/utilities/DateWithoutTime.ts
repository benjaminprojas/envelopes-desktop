/// <reference path='../_includes.ts' />

import * as moment from 'moment';

export class DateWithoutTime {

	public static getISOStringFormat():string {
		return "YYYY-MM-DD";
	}

	private _internalUTCMoment:moment.Moment;

	public constructor(year:number=-1, month:number=0, date:number=1) {

		if (year == -1) {
			var now:Date = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			date = now.getDate();
		}

		this._internalUTCMoment = moment.utc([year, month, date]);
	}

	// ****************************************************************************************
	// Static factory methods to create DateWithoutTime objects from either a date, or a string
	// ****************************************************************************************
	public static createFromMoment(momentValue:moment.Moment):DateWithoutTime {
		var dateWithoutTime:DateWithoutTime = new DateWithoutTime(momentValue.year(), momentValue.month(), momentValue.date());
		return dateWithoutTime;
	}

	// Assumes that the date passed in should be interpreted in the local timezone
	// So if you pass in December 31st, 2013 at 11:59pm, in the local timezone (say GMT-6),
	// You'll get a DateWithoutTime of December 31, 2013. Even though that time might be
	// 2014 in GMT+0 or UTC, that is irrelevant
	public static createFromLocalDate(dateValue:Date):DateWithoutTime {
		var dateWithoutTime:DateWithoutTime = new DateWithoutTime(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
		return dateWithoutTime;
	}

	public static createFromUTCTime(timeValue:number):DateWithoutTime {

		//Interpret this as a UTC time
		var utcMoment = moment.utc(timeValue);

		//a utc moment will automatically use the utc methods for the following functions
		return new DateWithoutTime(utcMoment.year(), utcMoment.month(), utcMoment.date());
	}

	public static createFromISOString(stringValue:string):DateWithoutTime {

		// The dates that are returned to us from the server are in the ISO format (YYYY-MM-DD)
		return DateWithoutTime.createFromString(stringValue, DateWithoutTime.getISOStringFormat());
	}

	public static createFromString(stringValue:string, format:string):DateWithoutTime {

		// The Date.parse method when parsing these dates assumes that the timezone is UTC.
		// We are going to parse this passed date, and then just copy the year, month and date
		// values from it, to create a new Date that is in the local timezone.

		// This results in creating two moments - one to parse, and one in the date constructor
		// That's kinda lame, but we could make it more efficient later
		// We use moment's parsing because it's more explicit, and less browser dependent then Date.parse
		// I don't make it strict because they might include time in here as well.
		var tempMoment = moment.utc(stringValue, format, false);
		if (!tempMoment.isValid())
			throw new Error("Invalid date: " + stringValue);

		return new DateWithoutTime(tempMoment.year(), tempMoment.month(), tempMoment.date());
	}

	public static createForToday():DateWithoutTime {

		return new DateWithoutTime();
	}

	public static createForCurrentMonth():DateWithoutTime {

		// Create a date for now
		var internalDate:Date = new Date();
		return new DateWithoutTime(internalDate.getFullYear(), internalDate.getMonth(), 1);
	}

	public static isValid(stringValue:string, format:string):boolean {

		var tempMoment = moment(stringValue, format, false);
		return tempMoment.isValid();
	}

	public clone():DateWithoutTime {

		return new DateWithoutTime( this.getYear(), this.getMonth(), this.getDate() );
	}

	// ****************************************************************************************
	// Instance methods to get a date or string value from the DateWithoutTime instance
	// ****************************************************************************************
	public getUTCTime():number {

		return this._internalUTCMoment.valueOf();
	}
	
	public getUTCTimeSeconds():number {

		return (this._internalUTCMoment.valueOf() / 1000);
	}

	public getYear():number {

		return this._internalUTCMoment.year();
	}

	public setYear(val:number):DateWithoutTime {

		this._internalUTCMoment.year(val);
		return this;
	}

	public getMonth():number {

		return this._internalUTCMoment.month();
	}

	public setMonth(val:number):DateWithoutTime {

		this._internalUTCMoment.month(val);
		return this;
	}


	public getDate():number {

		return this._internalUTCMoment.date();
	}

	public setDate(val:number):DateWithoutTime {

		this._internalUTCMoment.date(val);
		return this;
	}

	/**
	 * Not locale aware. 0 == Sunday, 1 == Monday
	 * @returns {number}
	 */
	public getDayOfWeek():number {

		return this._internalUTCMoment.day();
	}

	public setDayOfWeek(val:number):DateWithoutTime {

		this._internalUTCMoment.day(val);
		return this;
	}

	/**
	 * Locale aware. If the locale is set to have the beginning of the week be a Sunday,
	 * and the date is a Sunday, the ret val is a 0. If the beginning fo the week is a Monday
	 * Mondays are 0 instead.
	 * @returns {number}
	 */
	public getLocaleAwareDayOfWeek():number {
		return this._internalUTCMoment.weekday();
	}

	public setLocaleAwareDayOfWeek(val:number):DateWithoutTime {
		this._internalUTCMoment.weekday(val);
		return this;
	}

	// Returns the date as YYYY-MM-DD
	public toISOString():string {

		return this.format(DateWithoutTime.getISOStringFormat());
	}

	public toString():string {

		return this.toISOString();
	}

	public toNativeDate():Date {

		return this._internalUTCMoment.clone().toDate();
	}

	/**
	 * Gets a _clone_ of the internal UTCMoment. The internal moment is not exposed.
	 * Although convenient, you should prefer adding methods to DateWithoutTime instead of relying upon this method.
	 * @returns {Moment}
	 */
	public toUTCMoment():moment.Moment {

		return this._internalUTCMoment.clone();
	}

	public format(formatStr:string):string{

		return this._internalUTCMoment.format(formatStr);
	}

	// ****************************************************************************************
	// Comparison methods
	// ****************************************************************************************
	public equalsDate(dateToCompare: Date):boolean {

		if (this.getDate() === dateToCompare.getDate() &&
			this.getMonth() === dateToCompare.getMonth() &&
			this.getYear() === dateToCompare.getFullYear()) {

			return true;
		}
		else
			return false;
	}

	public equalsByMonth(dateWithoutTimeToCompare: DateWithoutTime):boolean {

		return (this.getMonth() == dateWithoutTimeToCompare.getMonth()) &&
			(this.getYear() == dateWithoutTimeToCompare.getYear());
	}

	public equalsDateWithoutTime(dateWithoutTimeToCompare: DateWithoutTime):boolean {

		if (dateWithoutTimeToCompare == null)
			return false;
		return this._internalUTCMoment.valueOf() == dateWithoutTimeToCompare._internalUTCMoment.valueOf();
	}

	public isAfter(dateWithoutTimeToCompare: DateWithoutTime):boolean {

		return this._internalUTCMoment.isAfter(dateWithoutTimeToCompare._internalUTCMoment);
	}
	
	public isBefore(dateWithoutTimeToCompare: DateWithoutTime):boolean {

		return this._internalUTCMoment.isBefore(dateWithoutTimeToCompare._internalUTCMoment);
	}

	public isPastDate():boolean {

		var todaysDate: DateWithoutTime = DateWithoutTime.createForToday();
		return this.isBefore(todaysDate);
	}

	public isFutureDate():boolean {

		var todaysDate: DateWithoutTime = DateWithoutTime.createForToday();
		return this.isAfter(todaysDate);
	}

	public isToday():boolean {

		var todaysDate: DateWithoutTime = DateWithoutTime.createForToday();
		return this.equalsDateWithoutTime(todaysDate);
	}


	public daysApart(dateWithoutTimeToCompare: DateWithoutTime): number {
		return Math.abs( this._internalUTCMoment.diff( dateWithoutTimeToCompare._internalUTCMoment, 'days' ) );
	}

	public monthsApart(dateWithoutTimeToCompare: DateWithoutTime): number {
		return Math.abs( this._internalUTCMoment.diff( dateWithoutTimeToCompare._internalUTCMoment, 'months' ) );
	}
	
	// ****************************************************************************************
	// Add/Subtract methods
	// ****************************************************************************************
	public addYears(numberOfYears:number):DateWithoutTime {

		this._internalUTCMoment.add(numberOfYears, "years");
		return this;
	}

	public subtractYears(numberOfYears:number):DateWithoutTime {

		this._internalUTCMoment.subtract(numberOfYears, "years");
		return this;
	}

	public addMonths(numberOfMonths:number):DateWithoutTime {

		this._internalUTCMoment.add(numberOfMonths, "months");
		return this;
	}

	public subtractMonths(numberOfMonths:number):DateWithoutTime {

		this._internalUTCMoment.subtract(numberOfMonths, "months");
		return this;
	}

	public addDays(numberOfDays:number):DateWithoutTime {

		this._internalUTCMoment.add(numberOfDays, "days");
		return this;
	}

	public subtractDays(numberOfDays:number):DateWithoutTime {

		this._internalUTCMoment.subtract(numberOfDays, "days");
		return this;
	}

	public startOfMonth():DateWithoutTime {

		this._internalUTCMoment.startOf("month");
		return this;
	}

	public startOfYear():DateWithoutTime {

		this._internalUTCMoment.startOf("year");
		return this;
	}

	public endOfMonth():DateWithoutTime {

		this._internalUTCMoment.endOf("month");
		return this;
	}

	public endOfYear():DateWithoutTime {

		this._internalUTCMoment.endOf("year");
		return this;
	}

	public daysInMonth():number {

		return this._internalUTCMoment.daysInMonth();
	}

	public fromNow(noSuffix:boolean=false):string {

		return this._internalUTCMoment.fromNow(noSuffix);
	}

	// Function suitable for use in sort functions
	public static compare(a:DateWithoutTime, b:DateWithoutTime):number {
		return a.getUTCTime() - b.getUTCTime();
	}

	public static equals(a:DateWithoutTime, b:DateWithoutTime):boolean {

		var aStr = a ? a.toISOString() : null;
		var bStr = b ? b.toISOString() : null;
		return (aStr == bStr);
	}
	
	public static earliest(...dates: DateWithoutTime[]):DateWithoutTime {
		var earliest:DateWithoutTime = null;
		
		if (dates) {
			for (var i = 0; i < dates.length; i++) {
				if (dates[i] && (earliest == null || dates[i].isBefore(earliest))){
					earliest = dates[i];
				}
			}
		}
		
		return earliest;
	}
}