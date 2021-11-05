module.exports = class TouchSlider {
	constructor(selector) {
		this.selector = selector;
		this.dragging = false;
		this.marginOffset = 0;
		this.prevMarginOffset = 0;
		this.direction = 0;
		this.init();
	}

	init() {
		this.setElements();
		this.setBoundFunctions();
		this.fullWidth = this.calcFullWidth();
		this.el.addEventListener('mousedown', this.onMouseDown);
	}

	setElements() {
		this.el = document.querySelector(this.selector);
		this.wrapper = this.el.querySelector('.slider-wrapper');
	}

	setBoundFunctions() {
		this.onMouseDown = this.handleMouseDown.bind(this);
		this.onMouseUp = this.handleMouseUp.bind(this);
		this.onMouseMove = this.handleMouseMove.bind(this);
	}

	setDirection(xDiff) {
		this.direction = xDiff < 0 ? -1 : 1;
	}

	pxToNum(pixels) {
		const numericValue = pixels.slice(0, -2);
		return Number(numericValue);
	}

	calcFullWidth() {
		const paddingRight = window.getComputedStyle(this.wrapper).paddingRight;
		let totalChildrenWidth = 0;
		let totalMarginLeft = 0;
		let totalMarginRight = 0;

		[...this.wrapper.children].forEach(child => {
			const style = window.getComputedStyle(child);
			totalChildrenWidth += child.offsetWidth;
			totalMarginLeft += this.pxToNum(style.marginLeft);
			totalMarginRight += this.pxToNum(style.marginRight);
		});

		return (
			totalChildrenWidth +
			totalMarginLeft +
			totalMarginRight +
			this.pxToNum(paddingRight)
		);
	}

	getMarginOffset(xDiff) {
		const newValue = Math.abs(this.prevMarginOffset - xDiff);
		const maxMargin = this.fullWidth - this.el.offsetWidth;

		if (newValue <= maxMargin) {
			return this.prevMarginOffset - xDiff;
		}

		if (this.direction === 1) {
			return -maxMargin;
		}

		let endValue = -maxMargin;
		if (this.prevMarginOffset > -maxMargin) {
			endValue = this.prevMarginOffset;
		}

		return endValue - xDiff;
	}

	handleMouseDown(e) {
		e.preventDefault();
		this.initX = e.clientX;
		this.el.addEventListener('mousemove', this.onMouseMove);
		this.el.addEventListener('mouseup', this.onMouseUp);
	}

	handleMouseUp() {
		this.el.removeEventListener('mousemove', this.onMouseMove);
		this.el.removeEventListener('mouseup', this.onMouseUp);
		this.prevMarginOffset = this.marginOffset;
	}

	handleMouseMove(e) {
		const xDiff = this.initX - e.clientX;
		this.setDirection(xDiff);

		if (this.prevMarginOffset - xDiff > 0) return;

		this.marginOffset = this.getMarginOffset(xDiff);
		this.wrapper.style.marginLeft = this.marginOffset + 'px';
	}
};
