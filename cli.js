#!/usr/bin/env node
'use strict'

import { program } from 'commander'
import fs from "fs"
import path from "path"
import isSvg from 'is-svg'
import { parse } from 'svgson'
import { createSVGWindow } from 'svgdom'
import { SVG, registerWindow } from '@svgdotjs/svg.js'

const getPaths = (node) => {
    let paths = []
    if (node.name == 'path') {
        // push the path id and geometry to paths array
        paths.push({id: node.attributes.id, d: node.attributes.d.replaceAll('\n', ' ')})
    } else if (node.children && Array.isArray(node.children)) {
        // process the paths children recursively
        paths.push(...node.children.map(getPaths))
    }
    return paths
}

const description = `Extract svg paths by id and save them to new svg files.

    --ids can be given multiple times or once with multiple values separated by space.`

program
    .description(description)
    .argument('<input file>', 'svg input file to convert')
    .requiredOption('--ids <paths-ids...>', 'path ids to extract, that start with the specified values.')
    .option('--ids-only', 'extract specified ids only, no others')
    .action(async (inputFile, options) => {
        const filePath = path.parse(inputFile)
        const file = fs.readFileSync(inputFile)
        const fileData = file.toString()
        if (!isSvg(fileData)) {
            throw 'Invalid SVG'
        }

        // parse the svg file
        const parsedSVG = await parse(fileData)

        // get an array of paths
        const SVGPaths = getPaths(parsedSVG).flat(Infinity)

        // make an object out of our options.ids where we can push filtered paths into
        const pathIdGroups = options.ids.reduce((o, key) => ({ ...o, [key]: []}), {})
        pathIdGroups.others = []
        
        for (const node of SVGPaths) {
            let found = false;
            for (const id of options.ids) {
                if (node.id.startsWith(id)) {
                    pathIdGroups[id].push(node) 
                    found = true;
                    break
                }
            }
            if (!found && !options.idsOnly) {
                // if node.id does not start with any provided id, push it to others
                pathIdGroups.others.push(node)
            }
        } 
        
        // create a new svg file for each id
        for (const [id, nodes] of Object.entries(pathIdGroups)) {
            if (nodes.length) {
                // create a new svg document
                const window = createSVGWindow()
                const document = window.document
                registerWindow(window, document)
                const svg = SVG(document.documentElement).size(parsedSVG.attributes.width, parsedSVG.attributes.height)
                
                // create paths
                for (const node of nodes) {
                    svg.path(node.d).attr({id: node.id})
                }

                // save svg file
                const svgPath = path.join(filePath.dir, filePath.name + '-' + id + filePath.ext)
                fs.writeFileSync(svgPath, svg.svg())
            }
        }

    })

program.parse()