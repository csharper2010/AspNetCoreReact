import * as React from 'react';

import './Grid.css';

interface GridColumnProps<T> {
    width?: number;
    caption: React.ReactNode;
    content: (item: T) => React.ReactNode;
}

export class GridColumn<T> extends React.Component<GridColumnProps<T>, {}> {
    constructor(props: GridColumnProps<T>, context?: any) {
        super(props, context);
    }
    public render() {
        return <div>{this.props.caption}</div>;
    }
}

interface GridProps<T> {
    items: T[];
    children?: any;
    defaultSelectedItemIndex?: number;
    selectedItemIndex?: number;
    onSelectedItemIndexChanged?: (newSelectedItemIndex: number) => boolean;
    onDelete?: (selectedItemIndex: number) => void;
    onAcceptSelection?: (selectedItemIndex: number) => void;
}

interface Ref<T extends HTMLElement> {
    current: null | T;
}

interface GridState {
    selectedItemIndex: number;
}

export class Grid<T> extends React.Component<GridProps<T>, GridState> {
    scrollRegionRef: Ref<HTMLDivElement>;
    selectedElementRef: null | HTMLTableRowElement;

    public static getDerivedStateFromProps(nextProps: Readonly<GridProps<any>>, prevState: GridState): GridState {
        return {
            selectedItemIndex: nextProps.selectedItemIndex || prevState.selectedItemIndex,
        };
    }

    constructor(props: GridProps<T>, context?: any) {
        super(props, context);
        this.state = {
            selectedItemIndex: props.selectedItemIndex || props.defaultSelectedItemIndex || 0,
        };
        this.scrollRegionRef = (React as any).createRef();
    }

    public render() {
        const selectedItemIndex = this.state.selectedItemIndex;
        const columns = this.props.children as GridColumn<T>[] || [];
        this.selectedElementRef = null;
        return (
            <div ref={this.scrollRegionRef as any} onKeyDown={e => this.keyDown(e)} tabIndex={0} className="grid">
                <table ref={this.scrollRegionRef as any} className="table">
                    <colgroup>
                        {(columns.map((c, index) => <col key={index} width={c.props.width} />))}
                    </colgroup>
                    <thead>
                        <tr>
                            {(columns.map((c, index) => <th key={index}>{c}</th>))}
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.items.map(
                            (item, rowIndex) => {
                                const columnElements = columns.map((c, colIndex) => <td key={colIndex}>{c.props.content(item)}</td>);
                                const isActiveRow = rowIndex === selectedItemIndex;
                                return (
                                    <tr
                                        ref={ref => { if (isActiveRow) { this.selectedElementRef = ref; } }}
                                        key={rowIndex}
                                        className={isActiveRow ? 'active' : ''}
                                        onClick={e => this.selectIndex(rowIndex)}
                                    >
                                        {columnElements}
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    private selectIndex(index: number) {
        if (this.props.onSelectedItemIndexChanged && !this.props.onSelectedItemIndexChanged(index)) {
            return;
        }
        this.setState({ selectedItemIndex: index });
    }

    private selectDelta(delta: number) {
        const newSelectedItemIndex = Math.max(Math.min(this.state.selectedItemIndex + delta, this.props.items.length - 1), 0);
        if (this.props.onSelectedItemIndexChanged && !this.props.onSelectedItemIndexChanged(newSelectedItemIndex)) {
            return;
        }
        this.ensureVisibleAfterScroll(newSelectedItemIndex - this.state.selectedItemIndex);
        this.setState({ ...this.state, selectedItemIndex: newSelectedItemIndex });
    }

    private getPageScrollDelta() {
        if (this.scrollRegionRef.current === null || this.selectedElementRef === null) {
            return 1;
        }
        return Math.trunc(this.scrollRegionRef.current.clientHeight / this.selectedElementRef.clientHeight);
    }

    private keyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        const selectedItemIndex = this.state.selectedItemIndex;
        switch (event.keyCode) {
            case 38:
                // links case 37:
                this.selectDelta(-1);
                event.preventDefault();
                break;
            case 40:
                // rechts case 39:
                this.selectDelta(1);
                event.preventDefault();
                break;
            case 33:
                // (this.scrollRegionRef.current as HTMLDivElement).scrollTop -= this.getPageScrollDelta(this.scrollRegionRef, this.selectedElementRef);
                this.selectDelta(-this.getPageScrollDelta());
                event.preventDefault();
                break;
            case 34:
                // (this.scrollRegionRef.current as HTMLDivElement).scrollTop += this.getPageScrollDelta(this.scrollRegionRef, this.selectedElementRef);
                this.selectDelta(this.getPageScrollDelta());
                event.preventDefault();
                break;
            case 46:
                if (this.props.onDelete) {
                    this.props.onDelete(selectedItemIndex);
                    event.preventDefault();
                }
                break;
            case 13:
                if (this.props.onAcceptSelection) {
                    this.props.onAcceptSelection(selectedItemIndex);
                    event.preventDefault();
                }
                break;
            default:
                break;
        }
    }

    private ensureVisibleAfterScroll(delta: number) {
        if (this.scrollRegionRef.current != null && this.selectedElementRef !== null) {
            if (this.state.selectedItemIndex + delta <= 0) {
                this.scrollRegionRef.current.scrollTop = 0;
            } else {
                const newTopPosition = this.selectedElementRef.offsetTop + delta * this.selectedElementRef.clientHeight;
                const newBottomPosition = newTopPosition + this.selectedElementRef.clientHeight;
                if (newTopPosition < this.scrollRegionRef.current.scrollTop) {
                    this.scrollRegionRef.current.scrollTop = newTopPosition;
                } else if (newBottomPosition > this.scrollRegionRef.current.scrollTop + this.scrollRegionRef.current.clientHeight) {
                    this.scrollRegionRef.current.scrollTop = newTopPosition - this.scrollRegionRef.current.clientHeight + this.selectedElementRef.clientHeight;
                }
            }
        }
    }

    // private getPageScrollDelta(scrollRegion: Ref<HTMLDivElement>, selectedElementRef: null | HTMLTableRowElement): any {
    //     if (scrollRegion.current === null) {
    //         return 0;
    //     }
    //     const itemHeight = scrollRegion.current.clientHeight / (this.props.items.length + 1);
    //     return Math.trunc(scrollRegion.current.clientHeight / itemHeight) * itemHeight;
    //     // if (selectedElementRef === null) {
    //     //     return scrollRegion.current.clientHeight;
    //     // }
    //     // return Math.trunc(scrollRegion.current.clientHeight / selectedElementRef.clientHeight) * selectedElementRef.clientHeight;
    // }
}