import get from 'lodash.get'

import { isFn } from './utils/helpers'

export interface BabelRC {
  presets?: any[]
  plugins?: any[]
  cacheDirectory?: boolean
  babelrc?: boolean
}

export type ModifyBundlerConfig<C = any> = (config: C, dev: boolean) => C
export type ModifyBabelRC = (babelrc: BabelRC) => BabelRC
export type OnServerListening = <S>(server: S) => void
export type OnPreBuild = () => void
export type OnPostBuild = () => void
export type OnPreRender = () => void
export type OnPostRender = () => void
export type Wrapper = <R>(props: any) => R

export interface PluginFactory {
  modifyBundlerConfig?: ModifyBundlerConfig
  modifyBabelRc?: ModifyBabelRC
  onServerListening?: OnServerListening
  onPreBuild?: OnPreBuild
  onPostBuild?: OnPostBuild
  onPreRender?: OnPreRender
  onPostRender?: OnPostRender
  wrapper?: Wrapper
}

export class Plugin<C = any> implements PluginFactory {
  public static runPluginsMethod(
    plugins: Plugin[]
  ): (method: keyof Plugin, ...args: any[]) => void {
    return (method, ...args) => {
      if (plugins && plugins.length > 0) {
        for (const plugin of plugins) {
          const fn = get(plugin, method)
          isFn(fn) && fn(...args)
        }
      }
    }
  }

  public static propsOfPlugins(
    plugins: Plugin[] | undefined
  ): (prop: keyof Plugin) => any {
    return prop =>
      plugins &&
      plugins.length > 0 &&
      plugins.map(p => get(p, prop)).filter(m => m)
  }

  public readonly modifyBundlerConfig?: ModifyBundlerConfig<C>
  public readonly modifyBabelRc?: ModifyBabelRC
  public readonly onServerListening?: OnServerListening
  public readonly onPreBuild?: OnPreBuild
  public readonly onPostBuild?: OnPostBuild
  public readonly onPreRender?: OnPreRender
  public readonly onPostRender?: OnPostRender
  public readonly wrapper?: Wrapper

  constructor(p: PluginFactory) {
    this.modifyBundlerConfig = p.modifyBundlerConfig
    this.modifyBabelRc = p.modifyBabelRc
    this.onServerListening = p.onServerListening
    this.onPreBuild = p.onPreBuild
    this.onPostBuild = p.onPostBuild
    this.onPreRender = p.onPreRender
    this.onPostRender = p.onPostRender
    this.wrapper = p.wrapper
  }
}

export function createPlugin<C = any>(factory: PluginFactory): Plugin<C> {
  return new Plugin(factory)
}