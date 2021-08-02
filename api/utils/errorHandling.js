async function tryCatcher(promise, errorMessage)
{
    try
    {
        const data = await promise;
        return [data, null];
    }
    catch (error)
    {
        console.error(errorMessage)
        return [null, error];
    }
}

module.exports = {
    tryCatcher
}