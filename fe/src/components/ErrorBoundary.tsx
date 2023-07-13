import React, {ErrorInfo} from "react";

type IProps = {onError: (error: any) => JSX.Element};
export class ErrorBoundary extends React.Component<IProps, {error: any}> {
    constructor(props: IProps) {
        super(props);
        this.state = {error: undefined};
    }

    static getDerivedStateFromError(error: any) {
        return {error};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(error, errorInfo);
    }

    render() {
        if (this.state.error) {
            return this.props.onError(this.state.error);
        }

        return this.props.children;
    }
}
