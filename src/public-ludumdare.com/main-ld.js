import { h, render, Component }			from 'preact/preact';
import NavBar 							from 'com/nav-bar/bar';

import ViewTimeline						from 'com/view-timeline/timeline';
import ViewSingle						from 'com/view-single/single';
import DarkOverlay						from 'com/dark-overlay/overlay';

import CoreData							from '../core-data/data';


window.LUDUMDARE_ROOT = '/';

class Main extends Component {
	constructor() {
//		this.state = {
//			root: 1,
//			node: 1,
//		};

		this.state = Object.assign(window.history.state ? window.history.state : {}, {
			root: 1,
			node: 1,
		});
		
		this.setActive(window.location);

		// Bind Events to handle future changes //
		var that = this;
		window.addEventListener('hashchange', that.onHashChange.bind(that));
		window.addEventListener('navchange', that.onNavChange.bind(that));
		window.addEventListener('popstate', that.onPopState.bind(that));
	}

	makeSlug( str ) {
		str = str.toLowerCase();
		str = str.replace(/%[a-f0-9]{2}/g,'-');
		str = str.replace(/[^a-z0-9]/g,'-');
		str = str.replace(/-+/g,'-');
		str = str.replace(/^-|-$/g,'');
		return str;
	}

	makeClean( str ) {
		str = str.toLowerCase();
		str = str.replace(/%[a-f0-9]{2}/g,'-');		// % codes = -
		str = str.replace(/[^a-z0-9\/#]/g,'-');		// non a-z, 0-9, #, or / with -
		str = str.replace(/-+/g,'-');				// multiple -'s to a single -
		str = str.replace(/\/+/g,'/');				// multiple /'s to a single /
//		str = str.replace(/^-|-$/g,'');				// Prefix and suffix -'s with nothing
		return str;
	}
	
	trimSlashes( str ) {
		return str.replace(/^\/|\/$/g,'');
	}
		
	setActive( whom ) {
		// Clean the URL //
		var clean = {
			pathname: this.makeClean(whom.pathname),
			search: whom.search,
			hash: this.makeClean(whom.hash),
		}
		var clean_path = clean.pathname+clean.search+clean.hash;

		// Parse the clean URL //
		var slugs = this.trimSlashes(clean.pathname).split('/');
		
		// Figure out what our active page_id actually is //
		this.state.node = parseInt(CoreData.getNodeIdByParentAndSlugs(this.state.root, slugs));
		
		// If current URL is unclean, replace it //
	//	if ( whom.pathname !== clean.pathname || whom.hash !== clean.hash ) {
			console.log('replaceState', this.state);
			window.history.replaceState(this.state, null, clean_path);
	//	}
	}

	
	componentDidMount() {
		// Startup //
	}
	
	onHashChange( e ) {
		console.log("hashchange: ", e);
		
		this.setState(this.state);
	}
	onNavChange( e ) {
		console.log("navchange: ", e.detail);
		//console.log( e.detail.href, e.detail.old.href );
		if ( e.detail.location.href !== e.detail.old.href ) {
			this.setActive(e.detail.location);
			this.setState(this.state);	// Force Refresh
			
			// Scroll to top
			window.scrollTo(0, 0);
		}
	}
	
	onPopState( e ) {
		// NOTE: This is sometimes called on a HashChange with a null state
		if ( e.state ) {
			console.log("popstate: ", e);
	
			this.setState(e.state);
			
			window.scrollTo(e.state.top, e.state.left);
		}
		else {
			console.log(location);
		}
	}
	
	getView( props, state ) {
		if ( state.node ) {
			var node = CoreData.getNodeById( state.node );
	
			if ( node.type === 'root' ) {
				return <ViewTimeline node={state.node} />;
			}
			else if ( node.type === 'post' || node.type === 'game' || node.type === 'user' ) {
				return <ViewSingle node={state.node} />;
			}
			else {
				return <div>unsupported</div>;
			}
		}
		else {
			return <div>404</div>;
		}
	}
	
	render( props, state ) {
		let hasHash = window.location.hash ? <DarkOverlay>{window.location.hash}</DarkOverlay> : <div />;
		//console.log("paint:",state);
		
		return (
			<div id="layout">
				<NavBar />
				{ this.getView(props,state) }
				{ hasHash }
			</div>
		);
	}
};

render(<Main />, document.body);
