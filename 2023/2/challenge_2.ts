import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { FileSystem } from "@effect/platform"
import { Array, Effect, Match, Number, Schema } from "effect"
import { pipe } from "effect/Function"

const parseStringToArray = (str: string) => str.split(/\r?\n/).map(line => line.trim());

const NumberStrings = Schema.Literal('zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine');

type NumberStrings = typeof NumberStrings.Type;

const matchNumbers = Match.type<NumberStrings>().pipe(
  Match.when('zero', () => "0"),
  Match.when('one', () => "1"),
  Match.when('two', () => "2"),
  Match.when('three', () => "3"),
  Match.when('four', () => "4"),
  Match.when('five', () => "5"),
  Match.when('six', () => "6"),
  Match.when('seven', () => "7"),
  Match.when('eight', () => "8"),
  Match.when('nine', () => "9"),
  Match.exhaustive
);

const numberRegex = /(?=(0|1|2|3|4|5|6|7|8|9|zero|one|two|three|four|five|six|seven|eight|nine))/gi;

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
      Effect.map((s) => Array.fromIterable(s.matchAll(numberRegex))),
      Effect.flatMap((m) =>
        m.length > 0
          ? Effect.succeed(m)
          : Effect.fail("No matches")
      ),
      Effect.map((matches) => matches.map((m) => {
        if (/^\d+$/.test(m[1])) return m[1];

        return matchNumbers(m[1] as NumberStrings);
      })),
      Effect.map((a) => pipe(
        a,
        (arr) => [Array.head(arr), Array.last(arr)],
        Array.getSomes,
        Array.join(''),
        Number.parse,
      )),
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
      Effect.tap(Effect.log),
    )
  )
)

NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)))