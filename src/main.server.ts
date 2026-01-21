import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context?: unknown) => {
    const options = context ? { ...config, context } : config;
    return bootstrapApplication(App, options);
};

export default bootstrap;
