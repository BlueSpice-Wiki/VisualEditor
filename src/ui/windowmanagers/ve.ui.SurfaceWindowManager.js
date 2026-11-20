/*!
 * VisualEditor UserInterface SurfaceWindowManager class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Window manager for desktop inspectors.
 *
 * @class
 * @extends ve.ui.WindowManager
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface this belongs to
 * @param {Object} [config] Configuration options
 * @param {ve.ui.Overlay} [config.overlay] Overlay to use for menus
 */
ve.ui.SurfaceWindowManager = function VeUiSurfaceWindowManager( surface, config = {} ) {
	// Properties
	// Set up surface before calling the parent so we can request
	// specific surface-related details from within the constructor.
	this.surface = surface;

	// Parent constructor
	ve.ui.SurfaceWindowManager.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.SurfaceWindowManager, ve.ui.WindowManager );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.SurfaceWindowManager.prototype.closeWindow = function ( win ) {
	const closingWindow = typeof win === 'string' ? this.getCurrentWindow() : win;
	// Parent method
	const lifecycle = ve.ui.SurfaceWindowManager.super.prototype.closeWindow.apply( this, arguments );
	lifecycle.closed.then( () => {
		// OO.ui.WindowManager returns focus to the element that was focused when the window was
		// opened. If that element is gone or hidden by now (e.g. a tool in a toolbar menu), focus
		// is lost to the page body, and keyboard users have to start over from the top of the page.
		// The same happens if something inside the window took focus while it was closing.
		// Return focus to the document instead.
		const focused = document.activeElement,
			surface = this.getSurface();
		if (
			(
				!focused || focused === document.body ||
				( closingWindow && OO.ui.contains( closingWindow.$element[ 0 ], focused, true ) )
			) &&
			surface && surface.getView() && document.contains( surface.getView().$element[ 0 ] )
		) {
			surface.getView().focus();
		}
	} );
	return lifecycle;
};

/**
 * Get surface.
 *
 * @return {ve.ui.Surface} Surface this belongs to
 */
ve.ui.SurfaceWindowManager.prototype.getSurface = function () {
	return this.surface;
};
