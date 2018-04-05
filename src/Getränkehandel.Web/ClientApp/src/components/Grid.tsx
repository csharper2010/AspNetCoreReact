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

export class Grid<T> extends React.Component<GridProps<T>, { selectedItemIndex: number }> {
    scrollRegionRef: Ref<HTMLDivElement>;
    selectedElementRef: null | HTMLTableRowElement;

    constructor(props: GridProps<T>, context?: any) {
        super(props, context);
        this.state = {
            selectedItemIndex: props.selectedItemIndex || props.defaultSelectedItemIndex || 0,
        };
        this.scrollRegionRef = (React as any).createRef();
    }

    public render() {
        const selectedItemIndex = this.props.selectedItemIndex || this.state.selectedItemIndex;
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
                                        ref={ref => { if (isActiveRow) { this.selectedElementRef = ref; }}}
                                        key={rowIndex}
                                        className={isActiveRow ? 'active' : ''}
                                        onClick={e => this.select(rowIndex)}
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

    private select(index: number) {
        if (this.props.onSelectedItemIndexChanged && !this.props.onSelectedItemIndexChanged(index)) {
            return;
        }
        this.setState({ selectedItemIndex: index });
    }

    private keyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        const selectedItemIndex = this.props.selectedItemIndex || this.state.selectedItemIndex;
        switch (event.keyCode) {
            case 38:
                // links case 37:
                if (selectedItemIndex > 0) {
                    this.select(selectedItemIndex - 1);
                }
                event.preventDefault();
                break;
            case 40:
                // rechts case 39:
                if (selectedItemIndex < this.props.items.length - 1) {
                    this.select(selectedItemIndex + 1);
                }
                event.preventDefault();
                break;
            case 33:
                (this.scrollRegionRef.current as HTMLDivElement).scrollTop -= this.getPageScrollDelta(this.scrollRegionRef, this.selectedElementRef);
                event.preventDefault();
                break;
            case 34:
                (this.scrollRegionRef.current as HTMLDivElement).scrollTop += this.getPageScrollDelta(this.scrollRegionRef, this.selectedElementRef);
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

    private getPageScrollDelta(scrollRegion: Ref<HTMLDivElement>, selectedElementRef: null | HTMLTableRowElement): any {
        if (scrollRegion.current === null) {
            return 0;
        }
        return scrollRegion.current.clientHeight;
        // if (selectedElementRef === null) {
        //     return scrollRegion.current.clientHeight;
        // }
        // return Math.trunc(scrollRegion.current.clientHeight / selectedElementRef.height) * selectedElementRef.height;
    }
}