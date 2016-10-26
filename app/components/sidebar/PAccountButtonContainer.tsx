/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

const PAccountButtonContainerStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	width: '100%',
	alignItems: 'center',
	cursor: 'pointer'
};

const PAccountButtonContainerButtonStyle = {
	flex: '1 1 auto',
	borderRadius: '0px',
	color: 'white',
	backgroundColor: "transparent",
	borderColor: "transparent",
	fontSize: '12px',
	textAlign: 'left',
	outline: 'none',
	boxShadow: 'none'
};

const PAccountButtonContainerValueStyle = {
	color: 'white',
	fontSize: '12px',
	fontWeight: 'normal', 
};

const PAccountButtonContainerValueWithBadgeStyle = {
	flex: '1 1 auto',
	color: '#D33C2D',
	fontSize: '12px',
	fontWeight: 'normal', 
	backgroundColor: 'white'
};

export interface PAccountButtonContainerProps {
	identity: string,
	label: string,
	value: number,
	expanded: boolean,
	setExpanded: (expanded:boolean)=>void;
}

export class PAccountButtonContainer extends React.Component<PAccountButtonContainerProps, {}> {

	constructor(props: any) {
        super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	private handleClick() {
		// Flip the expanded state
		this.props.setExpanded( !this.props.expanded );
	}

  	public render() {

		var valueNode;
		var glyphiconClass, containerClass:string;
		var collapseContainerIdentity = "collapseContainer_" + this.props.identity;

		if(this.props.expanded == true) {
			glyphiconClass = "glyphicon glyphicon-triangle-bottom";
			containerClass = "collapse in";
		}
		else {
			glyphiconClass = "glyphicon glyphicon-triangle-right";
			containerClass = "collapse";
		}

		if(this.props.value < 0)
			valueNode = <span className="badge" style={PAccountButtonContainerValueWithBadgeStyle}>{this.props.value}</span>;
		else
			valueNode = <span style={PAccountButtonContainerValueStyle}>{this.props.value}</span>;

		return (
			<div>
				<div style={PAccountButtonContainerStyle}>
					<button 
						className="btn btn-primary btn-block" 
						style={PAccountButtonContainerButtonStyle}
						type="button" 
						data-toggle="collapse" 
						data-target={'#' + collapseContainerIdentity} 
						onClick={this.handleClick}>

						<span className={glyphiconClass}></span>
						&nbsp;{this.props.label}
					</button>
					<div>
						{valueNode}
					</div>
					<span style={{width:'8px'}} />
				</div>
				<div className={containerClass} id={collapseContainerIdentity}>
					{this.props.children}
				</div>
				<hr className="sidebar-horizontal-rule" />
			</div>
		);
	}
}
