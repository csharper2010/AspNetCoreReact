import * as React from 'react';

interface TabProps {
    title: string;
    content: JSX.Element;
    isActive?: boolean;
    hotKey?: string;
}

export class Tab extends React.Component<TabProps, any> {
    constructor(props: TabProps, context?: any) {
        super(props, context);
    }
    public render() {
        return <div>{this.props.content}</div>;
    }
}

interface TabsProps {
    defaultTabIndex?: number;
    tabIndex?: number;
    onTabIndexChanged?: (newTabIndex: number) => boolean;
    children?: any;
}

export class Tabs extends React.Component<TabsProps, { tabIndex: number }> {
    private tabHeaders: HTMLElement | null;

    constructor(props: TabsProps, context?: any) {
        super(props, context);
        this.tabHeaders = null;
        this.state = {
            tabIndex: props.tabIndex || props.defaultTabIndex || 0,
        };
    }

    public render() {
        let activeTabIndex = this.props.tabIndex || this.state.tabIndex;
        let tabs = this.props.children || [] as Tab[];
        return (
            <div>
                <ul className="tab tab-block" tabIndex={0} onKeyDown={e => this.keyDown(e)} ref={t => { this.tabHeaders = t; }}>
                    {tabs.map((tab: Tab, index: number) => (
                        <li className={index === activeTabIndex ? 'tab-item active' : 'tab-item'} key={index} onClick={() => this.setActiveTab(index)}>
                            <a href="#">{this.getTabHeader(tab.props.title, tab.props.hotKey)}</a>
                        </li>
                    ))}
                </ul>
                <div className="nav-tab-content">
                    {tabs[activeTabIndex].props.content}
                </div>
            </div>);
    }

    public componentDidMount() {
        document.addEventListener('keydown', e => this.globalKeyDown(e));
    }

    public componentWillUnmount() {
        document.removeEventListener('keydown', e => this.globalKeyDown(e as any));
    }

    getTabHeader(title: string, hotKey?: string): JSX.Element {
        let index: number;
        if (hotKey) {
            if ((index = title.toLowerCase().indexOf(hotKey.toLowerCase())) >= 0) {
                return <span>{title.substring(0, index)}<u>{title.substring(index, index + 1)}</u>{title.substring(index + 1)}</span>;
            } else {
                return <span>{title}&nbsp;(<u>{hotKey.toUpperCase()}</u>)</span>;
            }
        }
        return <span>{title}</span>;
    }

    setActiveTab(index: number) {
        if (this.props.onTabIndexChanged && !this.props.onTabIndexChanged(index)) {
            return;
        }
        this.setState({ tabIndex: index });
    }

    keyDown(event: React.KeyboardEvent<HTMLUListElement>) {
        if (event.keyCode === 38 || event.keyCode === 37) {
            if (this.state.tabIndex > 0) {
                this.setActiveTab(this.state.tabIndex - 1);
            }
            event.preventDefault();
        } else if (event.keyCode === 40 || event.keyCode === 39) {
            if (this.state.tabIndex < this.props.children.length - 1) {
                this.setActiveTab(this.state.tabIndex + 1);
            }
            event.preventDefault();
        }
    }

    globalKeyDown(event: KeyboardEvent) {
        let index: number;
        if (event.altKey) {
            if ((index = (this.props.children as Tab[] || [] as Tab[])
                .findIndex(t => t.props.hotKey != null && event.key.localeCompare(t.props.hotKey, undefined, { sensitivity: 'accent' }) === 0)) >= 0) {
                this.setActiveTab(index);
                if (this.tabHeaders) {
                    (this.tabHeaders as HTMLElement).focus();
                }
                event.preventDefault();
            }
        }
    }
}
