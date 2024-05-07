# svg-extract-paths-cli

Extract svg paths by id and save them to new svg files.

## Install

`npm i -g svg-extract-paths-cli`

## Usage

`svg-extract-paths <input-file> [options]`

## Arguments

| Argument               | Description         |
| :--------------------  | :-----------        |
| `<input file>`         | path to input file  |

## Options

| Option                 | Description                                               |
| :--------------------  | :-----------                                              |
| `--ids <path>`         | path ids to extract, that start with the specified values |
| `--ids-only <path>`    | extract specified ids only, no others                     |
| `-h, --help`           | show help                                                 |

==--ids can be given multiple times or once with multiple values separated by space.==

## Todo
- Tests

## License

[MIT](LICENSE)