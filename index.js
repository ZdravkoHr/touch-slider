module.exports = class TouchSwiper {
	constructor(selector, options) {
		this.selector = selector;
		this.dragging = false;
		this.options = options;
		this.step = options?.step || 10;
		this.marginOffset = 0;
		this.prevMarginOffset = 0;
		this.direction = 0;
		this.controlSwiping = false;
		this.init();
	}

	set touchEvent(val) {
		this.isTouchEvent = val;
		this.moveEvent = this.touchEvent ? 'touchmove' : 'mousemove';
		this.releaseEvent = this.touchEvent ? 'touchend' : 'mouseup';
	}

	set marginOffset(val) {
		if (!this.wrapper) {
			this._marginOffset = 0;
			return;
		}

		if (this.direction === -1) {
			this._marginOffset = Math.max(val, -this.maxMargin);
		} else {
			this._marginOffset = Math.min(val, 0);
		}

		this.wrapper.style.marginLeft = this._marginOffset + 'px';
	}

	set controlSwiping(val) {
		this._swiping = val;

		if (!val) return;

		this.wrapper.style.transition = '0.5s';

		setTimeout(() => {
			this.wrapper.style.transition = '0s';
			this.controlSwiping = false;
		}, 500);
	}

	get controlSwiping() {
		return this._swiping;
	}

	get marginOffset() {
		return this._marginOffset;
	}

	get maxMargin() {
		const maxValue =
			this.fullWidth - (window.innerWidth - this.el.getBoundingClientRect().x);
		return Math.max(maxValue, 0);
	}

	get touchEvent() {
		return this.isTouchEvent || false;
	}

	init() {
		this.setElements();
		this.setBoundFunctions();
		this.setFullWidth();

		this.el.addEventListener('mousedown', e => {
			this.touchEvent = false;
			this.onStart(e);
		});

		this.el.addEventListener('touchstart', e => {
			this.touchEvent = true;
			this.onStart(e);
		});

		this.el.addEventListener('mouseleave', () => {
			this.onRelease();
		});

		window.addEventListener('resize', () => this.setFullWidth());
	}

	handleStart(e) {
		e.preventDefault();
		if (this.controlSwiping) return;
		this.initX = this.getClientX(e);
		this.el.addEventListener(this.moveEvent, this.onMove);
		this.el.addEventListener(this.releaseEvent, this.onRelease);
		return;
	}

	handleRelease() {
		this.el.removeEventListener(this.moveEvent, this.onMove);
		this.el.removeEventListener(this.releaseEvent, this.onRelease);
		this.prevMarginOffset = this.marginOffset;
	}

	getClientX(e) {
		const source = this.touchEvent ? e.touches[0] : e;
		return source.clientX;
	}

	handleMove(e) {
		const xDiff = this.initX - this.getClientX(e);

		this.setDirection(xDiff);

		if (this.prevMarginOffset - xDiff > 0) return;

		this.marginOffset = this.getMarginOffset(xDiff);
		this.wrapper.style.marginLeft = this.marginOffset + 'px';
	}

	setElements() {
		this.el = document.querySelector(this.selector);
		this.wrapper = this.el.querySelector('.slider-wrapper');
		this.prevEl = document.querySelector(this.options?.prevSelector) || null;
		this.nextEl = document.querySelector(this.options?.nextSelector) || null;
		this.bindControls();
	}

	swipe(direction) {
		if (this.controlSwiping) return;
		this.controlSwiping = true;
		this.direction = direction;
		this.marginOffset =
			this.marginOffset + (this.el.offsetWidth * direction) / 2;
		this.prevMarginOffset = this.marginOffset;
	}

	swipeForward() {
		this.swipe(-1);
	}

	swipeBack() {
		this.swipe(1);
	}

	bindControls() {
		this.prevEl?.addEventListener('click', this.swipeBack.bind(this));
		this.nextEl?.addEventListener('click', this.swipeForward.bind(this));
	}

	setBoundFunctions() {
		this.onStart = this.handleStart.bind(this);
		this.onRelease = this.handleRelease.bind(this);
		this.onMove = this.handleMove.bind(this);
	}

	setDirection(xDiff) {
		this.direction = xDiff < 0 ? -1 : 1;
	}

	pxToNum(pixels) {
		const numericValue = pixels.slice(0, -2);
		return Number(numericValue);
	}

	setFullWidth() {
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

		const fullWidth =
			totalChildrenWidth +
			totalMarginLeft +
			totalMarginRight +
			this.pxToNum(paddingRight);

		this.fullWidth = fullWidth;
	}

	getMarginOffset(xDiff) {
		const moveBy = this.direction * (this.step + Math.abs(xDiff));
		const newValue = Math.abs(this.prevMarginOffset - moveBy);
		const maxMargin = this.maxMargin;

		if (this.fullWidth <= this.el.offsetWidth) return 0;

		if (newValue <= maxMargin) {
			return this.prevMarginOffset - moveBy;
		}

		if (this.direction === 1) {
			return -maxMargin;
		}

		let endValue = -maxMargin;
		if (this.prevMarginOffset > -maxMargin) {
			endValue = this.prevMarginOffset;
		}

		return endValue - moveBy;
	}
};
