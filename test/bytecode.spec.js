const path = require('path')
const requireAll = require('require-all')
const execa = require('execa')
const { build, getOptions } = require('quantal')


describe('bytecode comparison', () => {
  test('openzeppelin', async () => {
    const PATH = path.join(__dirname, 'contracts/openzeppelin-solidity')
    await execa('npm', ['install'], { cwd: PATH })
    await execa('truffle', ['compile', '--all'], { cwd: PATH })

    const options = getOptions({ 
      cwd: PATH, 
      builtContractsDir: 'quantal-build', 
      noCache: true 
    })
    
    const result = await build(options)
    const truffleContracts = requireAll(path.join(PATH, 'truffle-build'))
    compareContracts(result.contracts, truffleContracts)
  }, 30000)

  test('synthetix', async () => {
    const PATH = path.join(__dirname, 'contracts/synthetix')
    await execa('npm', ['install'], { cwd: PATH })
    await execa('truffle', ['compile', '-all'], { cwd: PATH })

    const options = getOptions({ 
      cwd: PATH, 
      builtContractsDir: 'quantal-build', 
      noCache: true 
    })
    
    const result = await build(options)
    const truffleContracts = requireAll(path.join(PATH, 'truffle-build'))
    compareContracts(result.contracts, truffleContracts)
  }, 30000)
})

function compareContracts(contracts, truffleContracts) {
  for (const [contractName, artifact] of Object.entries(contracts)) {
    const truffleContract = findContract(contractName, truffleContracts)

    if (!truffleContract)
      throw new Error(`Cannot find truffle contract ${contractName}`)

    if (artifact.bytecode !== truffleContract.bytecode) {
      console.error(`Bytecode mismatch for contract ${contractName}`)
      expect(artifact.bytecode).toEqual(truffleContract.bytecode)
    }
  }
}

function findContract(contractName, contracts) {
  for (const [, artifact] of Object.entries(contracts)) {
    if (artifact.contractName === contractName)
      return artifact
  }
}
