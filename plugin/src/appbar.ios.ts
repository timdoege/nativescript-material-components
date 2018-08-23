import { AppBarBase } from './appbar-common';
import { ActionBar } from 'tns-core-modules/ui/action-bar/action-bar';
import { Color } from 'tns-core-modules/color/color';
import { layout } from 'tns-core-modules/utils/utils';
import { themer } from './material';

declare module 'tns-core-modules/ui/action-bar/action-bar' {
    interface ActionBar {
        _setupUI(context: android.content.Context, atIndex?: number, parentIsLoaded?: boolean);
    }
}

export class AppBar extends AppBarBase {
    // appBar: MDCAppBar;
    _appBarController: MDCAppBarViewController;
    addedToParent = false;
    public createNativeView() {
        this._appBarController = MDCAppBarViewController.alloc().init();
        // const _appBar = this.appBar = MDCAppBar.new();
        // _appBar.headerViewController.headerView.minMaxHeightIncludesSafeArea = false;
        // _appBar.navigationBar.inkColor = new Color('red').ios;
        // _appBar.navigationBar.tintColor  = new Color('blue').ios;
        // _appBar.headerViewController.headerView.backgroundColor = new Color('yellow').ios;
        // _appBar.navigationBar.sizeToFit();
        let colorScheme = themer.getAppColorScheme();
        if (colorScheme) {
            MDCAppBarColorThemer.applyColorSchemeToAppBarViewController(colorScheme, this._appBarController);
        }
        console.log('createNativeView AppBar');
        this._addController();
        return null;
    }
    // setupUI = false;
    // public _setupUI(context: android.content.Context, atIndex?: number, parentIsLoaded?: boolean): void {
    //     this.setupUI = true;
    //     super._setupUI(context, atIndex, parentIsLoaded);
    //     this.setupUI = false;
    // }
    get nativeViewProtected() {
        return this._appBarController ? this._appBarController.navigationBar : null;
    }
    get ios() {
        return this.nativeViewProtected;
    }

    public get _getActualSize(): { width: number; height: number } {
        const navBar = this.ios;
        if (!navBar) {
            return { width: 0, height: 0 };
        }

        const size = navBar.sizeThatFits(this._appBarController.navigationBar.frame.size);
        const width = layout.toDevicePixels(size.width);
        const height = layout.toDevicePixels(size.height);
        console.log('_getActualSize', width, height);
        return { width, height };
    }

    private _addController() {
        // console.log('_addController', this.addedToParent, this instanceof AppBar, this instanceof ActionBar);
        if (this._appBarController && !this.addedToParent) {
            const page = this.page;
            if (page && page.parent) {
                let showNavigationBar = true;
                Object.defineProperty(page.frame.ios, 'showNavigationBar', {
                    get: function() {

                        console.log('getting showNavigationBar');
                        return showNavigationBar;
                    },
                    set: function(value) {
                        console.log('setting showNavigationBar', value);
                        showNavigationBar = value;
                    }
                });
                const viewController = <UIViewController>page.ios;
                if (viewController.navigationController) {
                    viewController.navigationController.navigationBarHidden = true;
                }
                // let currentControllers = viewController.childViewControllers;
                // console.log('currentControllers', currentControllers.count);
                // if (currentControllers.count > 0) {
                //     currentControllers[0].removeFromParentViewController();
                // }
                // viewController.childViewControllers[0]
                this._appBarController.topLayoutGuideViewController = viewController;
                this._appBarController.inferPreferredStatusBarStyle = true;
                this._appBarController.inferTopSafeAreaInsetFromViewController = true;
                this._appBarController.topLayoutGuideAdjustmentEnabled = true;
                viewController.addChildViewController(this._appBarController);
                // console.log('addChildViewController done');
                this.addedToParent = true;
            }
        }
    }
    public onLoaded() {
        super.onLoaded();
        console.log('onLoaded');
        this._addController();
        // setTimeout(() => {
        const viewController = <UIViewController>this.page.ios;
        // if (viewController.navigationController) {
        //     viewController.navigationController.setNavigationBarHiddenAnimated(true, false);
        // }

        viewController.view.addSubview(this._appBarController.view);
        console.log('didMoveToParentViewController', viewController, viewController.navigationItem);
        this._appBarController.didMoveToParentViewController(viewController);
        // viewController.navigationItem.rightBarButtonItem = UIBarButtonItem.alloc().initWithBarButtonSystemItemTargetAction(UIBarButtonSystemItem.Done, null, null);
        // this.appBar.addSubviewsToParent();
        // }, 1000);
    }
}