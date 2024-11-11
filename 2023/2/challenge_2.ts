import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { FileSystem } from "@effect/platform"
import { Array, Chunk, Effect, Match, Number, Option, Schema, Stream, String } from "effect"
import { pipe } from "effect/Function"

const parseStringToArray = (str: string) => str.split(/\r?\n/).map(line => line.trim());

const strArray = ['two1nine',
  'eightwothree',
  'abcone2threexyz',
  'xtwone3four',
  '4nineeightseven2',
  'zoneight234',
  '7pqrstsixteen'
]

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

const numberWords: { [key: string]: string } = {
  'zero': '0',
  'one': '1',
  'two': '2',
  'three': '3',
  'four': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8',
  'nine': '9'
};

const numberRegex = /(?:0|1|2|3|4|5|6|7|8|9|zero|one|two|three|four|five|six|seven|eight|nine)/gi;

const replaceStringNumbers = (str: string) => pipe(
  str,
  s => s.replaceAll(numberRegex, (match) => numberWords[match]),
)

const readTextFile = (path: string) => pipe(
  FileSystem.FileSystem,
  Effect.flatMap(fs => fs.stream(path).pipe(
    Stream.decodeText,
    Stream.splitLines,
    Stream.runCollect,
    Effect.map(Chunk.toArray),
    Effect.tap(Effect.logInfo)
  ))
)

const getCalibrationValue = (input: string) =>
  // pipe(
  //   Effect.succeed(input),
  //   Effect.flatMap((str) => pipe(
  //     Effect.succeed(str),
  //     Effect.map(replaceStringNumbers),
  //     Effect.map(String.replaceAll(/\D/g, "")),
  //     Effect.map(String.split("")),
  //     Effect.map(a => Array.make(Array.headNonEmpty(a), Array.lastNonEmpty(a))),
  //     Effect.map(Array.join('')),
  //     Effect.map(Number.parse),
  //   ))
  // )
  pipe(
    Effect.succeed(input),
    Effect.flatMap((str) => pipe(
      Effect.succeed(str),
      Effect.map((s) => Option.fromNullable(s.match(numberRegex))),
      // match here...
      Effect.tap((val) => Effect.log(val)),
    ))
  )

const program = pipe(
  readTextFile("input.txt"),
  // Effect.succeed(strArray),
  Effect.flatMap(lines =>
    // pipe(
    //   lines,
    //   Effect.forEach((e) => getCalibrationValue(e)),
    //   Effect.map(Array.getSomes),
    //   Effect.map(Number.sumAll),
    //   Effect.tap((val) => Effect.log(val)),
    // )
    pipe(
      lines,
      Effect.forEach((e) => getCalibrationValue(e)),
    )
  )
)

NodeRuntime.runMain(readTextFile("input").pipe(Effect.provide(NodeContext.layer)))