import type { URLSearchParams } from "url";
function get_or_not(params: URLSearchParams, name: string): string|undefined{
    const found = params.get(name);
    if (found === null){
        return undefined;
    }
    else {
        return found;
    }
}

export interface CodeParams{
    project?: string;
    project_by_language?: string;
}
export function code_params_get(params: URLSearchParams): CodeParams{
    return {
       project: get_or_not(params, "project"),
       project_by_language: get_or_not(params, "project_by_language")
    }
}
export function params_string(params_obj: object): string{
    const write = [];
    for (const prop in params_obj){
        if (Object.prototype.hasOwnProperty.call(params_obj, prop)){
            write.push([prop.toString(), prop.valueOf()])
        }
    }
    if (write.length === 0){
        return "";
    }
    let out = "?";
    for (const pair of write){
        out = `${out}${pair[0]}=${pair[1]},`;
    }
    if (out.endsWith(",")){
        out = out.substring(0, out.length - 1);
    }
    return out;
}