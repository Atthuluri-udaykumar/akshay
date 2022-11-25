const postErrorHandling = async func => {
  try {
    const response = await func
    if (response.numberOfRecordsUpdated !== 1) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response
  }
  catch (e) {
    console.log(e);
  }
}

export default postErrorHandling