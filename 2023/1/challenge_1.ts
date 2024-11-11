import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { FileSystem } from "@effect/platform"
import { Array, Effect, Number, String } from "effect"
import { pipe } from "effect/Function"

const parseStringToArray = (str: string) => str.split(/\r?\n/).map(line => line.trim());

const readTextFile = (path: string) => pipe(
  FileSystem.FileSystem,
  Effect.flatMap(fs => fs.readFile(path)),
  Effect.map(content => content.toString()),
  Effect.catchAll(error => Effect.fail(`Error reading file: ${error}`))
)

const getCalibrationValue = (input: string) =>
  pipe(
    Effect.succeed(input),
    Effect.flatMap((str) => pipe(
      Effect.succeed(str),
      Effect.map(String.replaceAll(/\D/g, "")),
      Effect.map(String.split("")),
      Effect.map(a => Array.make(Array.headNonEmpty(a), Array.lastNonEmpty(a))),
      Effect.map(Array.join('')),
      Effect.map(Number.parse)
    ))
  )

const program = pipe(
  readTextFile("input.txt"),
  Effect.map(parseStringToArray),
  Effect.flatMap(lines =>
    pipe(
      lines,
      Effect.forEach((e) => getCalibrationValue(e)),
      Effect.map(Array.getSomes),
      Effect.map(Number.sumAll),
      Effect.tap((val) => Effect.log(val)),
    )
  )
)

NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)))