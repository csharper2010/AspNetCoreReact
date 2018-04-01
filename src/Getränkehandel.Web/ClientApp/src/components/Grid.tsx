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
}

export class Grid<T> extends React.Component<GridProps<T>, {selectedItemIndex: number}> {
    constructor(props: GridProps<T>, context?: any) {
        super(props, context);
        this.state = {
            selectedItemIndex: props.selectedItemIndex || props.defaultSelectedItemIndex || 0,
        };
    }

    public render() {
        const selectedItemIndex = this.props.selectedItemIndex || this.state.selectedItemIndex;
        const columns = this.props.children as GridColumn<T>[] || [];
        return (
            <div onKeyDown={e => this.keyDown(e)} tabIndex={0} style={{ 'overflow': 'auto' }}>
                <table className="table table-hover">
                    <colgroup>
                        {(columns.map((c, index) => <col key={index} width={c.props.width}/>))}
                    </colgroup>
                    <thead>
                        <tr>
                            {(columns.map((c, index) => <th key={index}>{c}</th>))}
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.items.map((item, rowIndex) =>
                            <tr key={rowIndex} className={rowIndex === selectedItemIndex ? 'active' : ''} onClick={e => this.select(rowIndex)}>
                                {(columns.map((c, colIndex) => <td key={colIndex}>{c.props.content(item)}</td>))}
                            </tr>)}
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
        if (event.keyCode === 38 || event.keyCode === 37) {
            const selectedItemIndex = this.props.selectedItemIndex || this.state.selectedItemIndex;
            if (selectedItemIndex > 0) {
                this.select(selectedItemIndex - 1);
            }
            event.preventDefault();
        } else if (event.keyCode === 40 || event.keyCode === 39) {
            const selectedItemIndex = this.props.selectedItemIndex || this.state.selectedItemIndex;
            if (selectedItemIndex < this.props.items.length - 1) {
                this.select(selectedItemIndex + 1);
            }
            event.preventDefault();
        } else if (event.keyCode === 46) {
            if (this.props.onDelete) {
                const selectedItemIndex = this.props.selectedItemIndex || this.state.selectedItemIndex;
                this.props.onDelete(selectedItemIndex);
                event.preventDefault();
            }
        }
    }
}