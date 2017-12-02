'use strict'
const {calculateNextVersionPackage} = require('./version-calculations')

async function findNextVersion(
  agent,
  agentInstance,
  directory,
  packageJson,
  npmCommander,
  npmCommanderSetup,
) {
  const registryPackageinfo = await getRegistryPackageInfo(
    agent,
    agentInstance,
    directory,
    packageJson,
    npmCommander,
    npmCommanderSetup,
  )

  const registryVersions =
    registryPackageinfo === undefined ? [] : normalizeVersions(registryPackageinfo.versions)

  return calculateNextVersionPackage(packageJson.version, registryVersions)
}

async function getRegistryPackageInfo(
  agent,
  agentInstance,
  directory,
  packageJson,
  npmCommander,
  npmCommanderSetup,
) {
  const packageName = packageJson.name

  try {
    const output = await agent.executeCommand(
      npmCommander.transformAgentCommand(
        {
          agentInstance,
          command: ['npm', 'view', '--json', packageName],
          cwd: directory,
          returnOutput: true,
        },
        {setup: npmCommanderSetup},
      ),
    )
    return JSON.parse(output)
  } catch (err) {
    if (JSON.parse(err.output).error.code === 'E404') {
      return undefined
    }

    throw err
  }
}

function normalizeVersions(versions) {
  return (versions || []).concat(versions)
}

module.exports = findNextVersion
