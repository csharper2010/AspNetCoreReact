import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Subscription } from 'rxjs/Subscription';
import { Navigator, NavigatorState } from './Navigator';

import { MainMenu } from './components/MainMenu';

class ApplicationFrame extends React.Component<{}, NavigatorState> {
    navigator: Navigator;
    subscription?: Subscription;
    constructor(props: {}, context?: any) {
        super(props, context);

        this.navigator = new Navigator();
        this.state = {
            content: [],
        };

        MainMenu.show(this.navigator);
    }

    componentDidMount() {
        this.subscription = this.navigator.state$.subscribe(n => this.setState(n));
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public render() {
        const content = this.state.content;

        var result = new Array<JSX.Element>();

        var lastFullScreenIndex = -1;
        for (var i = content.length - 1; i >= 0; i--) {
            if (content[i].state !== undefined && !content[i].modal) {
                lastFullScreenIndex = i;
                break;
            }
        }
        if (lastFullScreenIndex >= 0) {
            for (var i = lastFullScreenIndex; i < content.length; i++) {
                let commonProps = { navigator: this.navigator, inert: i < content.length - 1 };
                result.push(<React.Fragment key={i}>{content[i].render({ ...commonProps, ...content[i].state })}</React.Fragment>);
            }
        }

        return <>{result}</>;
    }
}

const App = () => <ApplicationFrame />;
// export default App;
export default hot(module)(App);
