import {CommandExecutionContext, CommandReturn, MoveCommand, SModelRoot} from "sprotty";
import {multiInject, inject, optional, injectable} from "inversify";

@injectable()
export class MoveListener {
    public listener: IMoveListener;
    public constructor(listener: IMoveListener) {
        this.listener = listener;
    }
}
export type IMoveListener = (model: Readonly<SModelRoot>) => void;

@injectable()
export class ListenableMoveCommand extends MoveCommand {
    @optional() @multiInject(MoveListener) protected listeners: MoveListener[];
    execute(context: CommandExecutionContext): CommandReturn {
        const result = super.execute(context);
        this.listeners.forEach(listener => listener.listener(context.root));
        return result;
    }
}
