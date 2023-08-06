import {
    Action,
    IVNodePostprocessor,
    ModelRendererFactory,
    ModelViewer,
    PatcherProvider,
    SModelRoot,
    TYPES,
} from "sprotty";
import {multiInject, inject, optional, injectable} from "inversify";

@injectable()
export class ModelListener {
    public listener: IModelListener;
    public constructor(listener: IModelListener) {
        this.listener = listener;
    }
}
export type IModelListener = (model: Readonly<SModelRoot>, cause?: Action) => void;

@injectable()
export class ListenableViewer extends ModelViewer {
    @optional() @multiInject(ModelListener) protected listeners: ModelListener[];

    update(model: Readonly<SModelRoot>, cause?: Action): void {
        this.listeners.forEach(listener => listener.listener(model, cause));
        super.update(model, cause);
    }
}
