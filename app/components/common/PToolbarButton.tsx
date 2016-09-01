/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';

export interface PToolbarButtonProps {
	text: string;
	glyphName: string;
	clickHandler?: (event:React.MouseEvent)=>void;
}

const PToolbarButtonCommonStyle = {
	cursor: 'pointer',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const PToolbarButtonDefaultStyle = {
	color: '#009cc2'
}

const PToolbarButtonHoverStyle = {
	color: '#005076'
}

const PToolbarButtonTextStyle = {
	fontSize: '13px',
	fontWeight: 'normal'
}

export class PToolbarButton extends React.Component<PToolbarButtonProps, {hoverState:boolean}> {

	constructor(props: any) {
        super(props);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = {hoverState:false};
	}

	private handleMouseEnter() {

		var state:any = _.assign({}, this.state);
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {

		var state:any = _.assign({}, this.state);
		state.hoverState = false;
		this.setState(state);
	}

  	public render() {

		var style:any;
		if(this.state.hoverState) 
			style = _.assign({}, PToolbarButtonCommonStyle, PToolbarButtonHoverStyle);
		else
			style = _.assign({}, PToolbarButtonCommonStyle, PToolbarButtonDefaultStyle);

		return (
			<div style={style} onClick={this.props.clickHandler} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<span className={"glyphicon " + this.props.glyphName} aria-hidden="true"></span>
				<text style={PToolbarButtonTextStyle}>&nbsp;{this.props.text}</text>
			</div>
		);
  	}
}