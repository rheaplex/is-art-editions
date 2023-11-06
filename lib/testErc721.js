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
  const tokenId1 = await instance.tokenByIndex(0);
  const tokenId2 = await instance.tokenByIndex(1);

  await instance.transferFrom(owner, other, tokenId1);
  expect(await instance.ownerOf(tokenId1))
    .to.equal(other);

  // Reset state so as not to disturb later tests with same instance.
  await instance.transferFrom(
    other,
    owner,
    tokenId1,
    { from: other }
  );

  try {
    await instance.transferFrom(
      other,
      owner,
      tokenId2,
      { from: other }
    );
    expect.fail("Should fail! Caller is not token owner nor approved.");
  } catch (error) {
    expect(error.data.reason)
      .to.equal("ERC721: caller is not token owner or approved");
  }
};

exports.urls = async (accounts, contract) => {
  const owner = accounts[0];
  const other = accounts[1];
  const instance = await contract.deployed();
  const tokenId1 = await instance.tokenByIndex(0);

  await instance.setBaseUri("aaa://newurl/");
  assert.equal(await instance.tokenURI(tokenId1),
               `aaa://newurl/${tokenId1.toString(10)}`);

  try {
    await instance.setBaseUri("aaa://newerurl/", { from: accounts[2] });
    assert(false, "token should throw if non-owner tries to set base URL");
  } catch (error) {
    // empty
  }
};
