import { clickCircleSvgProvider, clickRectSvgProvider, hoverCircleSvgProvider } from "./svg-provider-examples";

/**
 * provides interactive svg
 */
export interface ProvideInteractiveSvg {
    (): InteractiveSvg;
}

export interface InteractiveSvg {
    externalId: string;
    title: string;
    svgHtml: string;
    previewHtml: string;
}

export const availableSvgProviders: ProvideInteractiveSvg[] = [
    clickCircleSvgProvider,
    clickRectSvgProvider,
    hoverCircleSvgProvider
];
