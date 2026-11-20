/*!
 * VisualEditor UserInterface ToolbarDialog class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Toolbar dialog.
 *
 * @class
 * @abstract
 * @extends OO.ui.Dialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.ToolbarDialog = function VeUiToolbarDialog( config = {} ) {
	// Parent constructor
	ve.ui.ToolbarDialog.super.call( this, config );

	// Properties
	this.disabled = false;

	// Pre-initialization
	// This class needs to exist before setup to constrain the height
	// of the dialog when it first loads.
	this.$element.addClass( 've-ui-toolbarDialog' );
};

/* Inheritance */

OO.inheritClass( ve.ui.ToolbarDialog, OO.ui.Dialog );

/* Static Properties */

ve.ui.ToolbarDialog.static.size = 'full';

/**
 * The dialog is padded
 *
 * @static
 * @type {boolean}
 */
ve.ui.ToolbarDialog.static.padded = true;

/**
 * The dialog has a frame border, for use with position='side'
 *
 * @static
 * @type {boolean}
 */
ve.ui.ToolbarDialog.static.framed = true;

/**
 * Toolbar position, either 'above', 'side' (right in LTR), 'below' or 'inline'
 * For 'inline' the caller will be manually positioning the dialog.
 *
 * @static
 * @type {string}
 */
ve.ui.ToolbarDialog.static.position = 'above';

/* Methods */

/**
 * Handle focus events on the window's focus traps
 *
 * Toolbar dialogs are not modal, so unlike OO.ui.Dialog they must not keep focus cycling
 * inside the window (WCAG 2.1.2 No Keyboard Trap): Tab past the last element (or Shift+Tab
 * before the first one) moves focus out of the dialog, e.g. back to the document.
 *
 * @inheritdoc
 */
ve.ui.ToolbarDialog.prototype.onFocusTrapFocused = function ( e ) {
	const backwards = this.$focusTrapBefore.is( e.target ),
		fromInside = this.tabbingFromInside ||
			( !!e.relatedTarget && OO.ui.contains( this.$content[ 0 ], e.relatedTarget, true ) );
	if ( fromInside ) {
		const target = ve.findFocusableOutside( this.$element[ 0 ], backwards );
		if ( target ) {
			target.focus();
			return;
		}
	} else {
		// Entering the dialog from outside: Tab enters at the first element,
		// Shift+Tab at the last one
		this.focus( !backwards );
		return;
	}
	// Parent method
	ve.ui.ToolbarDialog.super.prototype.onFocusTrapFocused.call( this, e );
};

/**
 * @inheritdoc
 */
ve.ui.ToolbarDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.ToolbarDialog.super.prototype.initialize.call( this );

	// Remember when Tab is pressed inside the dialog, so #onFocusTrapFocused can tell leaving
	// the dialog from entering it (focus events' relatedTarget is not reliable in Firefox)
	this.tabbingFromInside = false;
	this.$content.on( 'keydown', ( e ) => {
		if ( e.which === OO.ui.Keys.TAB ) {
			this.tabbingFromInside = true;
			setTimeout( () => {
				this.tabbingFromInside = false;
			} );
		}
	} );

	this.$content.addClass( 've-ui-toolbarDialog-content' );
	// The following classes are used here:
	// * ve-ui-toolbarDialog-position-above
	// * ve-ui-toolbarDialog-position-side
	// * ve-ui-toolbarDialog-position-below
	// * ve-ui-toolbarDialog-position-inline
	this.$element.addClass( 've-ui-toolbarDialog-position-' + this.constructor.static.position );
	if ( this.constructor.static.padded ) {
		this.$element.addClass( 've-ui-toolbarDialog-padded' );
	}
	if ( this.constructor.static.framed ) {
		this.$element.addClass( 've-ui-toolbarDialog-framed' );
	}
	// Invisible title for accessibility
	this.title.setInvisibleLabel( true );
	this.$element.prepend( this.title.$element );
};

/**
 * Set the disabled state of the toolbar dialog
 *
 * @param {boolean} disabled Disable the dialog
 */
ve.ui.ToolbarDialog.prototype.setDisabled = function ( disabled ) {
	this.$content.addClass( 've-ui-toolbarDialog-content' );
	if ( disabled !== this.disabled ) {
		this.disabled = disabled;
		this.$body.toggleClass( 've-ui-toolbarDialog-disabled', this.disabled );
	}
};

/**
 * @inheritdoc
 */
ve.ui.ToolbarDialog.prototype.getTeardownProcess = function ( data ) {
	ve.track( 'activity.' + this.constructor.static.name, { action: 'dialog-' + ( data && data.action || 'abort' ) } );
	return ve.ui.ToolbarDialog.super.prototype.getTeardownProcess.apply( this, arguments );
};
