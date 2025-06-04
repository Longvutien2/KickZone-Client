'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 text-center mb-4 max-w-md">
            Không thể tải nội dung này. Vui lòng thử lại hoặc tải lại trang.
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleRetry}>
              Thử lại
            </Button>
            <Button 
              type="primary" 
              onClick={() => window.location.reload()}
              className="bg-[#FE6900] hover:bg-[#E55A00] border-[#FE6900] hover:border-[#E55A00]"
            >
              Tải lại trang
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 p-4 bg-gray-100 rounded-lg w-full max-w-2xl">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Chi tiết lỗi (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-600 overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
