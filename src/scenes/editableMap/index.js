import React, { Component } from 'react';
import { connect } from 'react-redux';

const cheese = 'https://cdn-images-1.medium.com/max/1600/1*W1IPZj18aerIffSO321a2w.png'

class Canvas extends Component {
    componentDidMount() {
        const canvas = this.refs.canvas
        const ctx = canvas.getContext("2d")
        var img = new Image;
        img.onload = () => {
            ctx.drawImage(img, 0, 0)
            ctx.font = "40px Courier"
            ctx.fillText('COUCOU', 210, 75)
        }
        img.src = cheese;
    }
    render() {
        console
        return (
            <div>
                <canvas ref="canvas" width={640} height={425} />
            </div>
        )
    }
}

const mapStateToProps = () => {
    return {};
}
export default connect(mapStateToProps, {})(Canvas);

