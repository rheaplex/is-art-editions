/* global expect exports */

exports.setup = async (accounts, contract, name, symbol, numTokens) => {
  const owner = accounts[0];
  const other = accounts[1];
  const instance = await contract.deployed();

  expect((await instance.totalSupply()).toNumber()).to.equal(numTokens);
  expect(await instance.name()).to.equal(name);
  expect(await instance.symbol()).to.equal(symbol);

  expect((await instance.balanceOf(owner)).toNumber()).to.equal(numTokens);
};

exports.transfers = async (accounts, contract) => {
  const owner = accounts[0];
  const other = accounts[1];
  const instance = await contract.deployed();

  await instance.transferFrom(owner, other, 1);
  expect(await instance.ownerOf(1))
    .to.equal(other);

  try {
    await instance.transferFrom(
      other,
      owner,
      2,
      { from: other }
    );
    expect.fail("Should fail! Caller is not token owner nor approved.");
  } catch (error) {
    expect(error.data.reason)
      .to.equal("ERC721: caller is not token owner or approved");
  }

  try {
    await instance.transferFrom(
      owner,
      other,
      1,
      { from: other }
    );
    expect.fail("Should fail! ERC721: transfer from incorrect owner.");
  } catch (error) {
    expect(error.data.reason)
      .to.equal("ERC721: transfer from incorrect owner");
  }
};

exports.urls = async (accounts, contract) => {
  const owner = accounts[0];
  const other = accounts[1];
  const instance = await contract.deployed();

  await instance.setBaseUri("aaa://newurl/");
  assert.equal(await instance.tokenURI(3), "aaa://newurl/3");

  try {
    await instance.setBaseUri("aaa://newerurl/", { from: accounts[2] });
    assert(false, "token should throw if non-owner tries to set base URL");
  } catch (error) {
    // empty
  }
};
