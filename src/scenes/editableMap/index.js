import React, { Component } from 'react';
import { connect } from 'react-redux';

class editableMap extends Component {

    componentDidMount() {
        console.log('COUCOU')


        // <canvas id="tutorial" width="150" height="150"></canvas>
    }

    render() {
        return (
            <div className='editor' ref={(elt) => { this.editorElement = elt; }} >
                EDIT
            </div>
        );
    }

}

const mapStateToProps = () => {
    return {};
}
export default connect(mapStateToProps, {})(editableMap);

