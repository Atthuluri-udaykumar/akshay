import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import {
  indexReferenceDataRecords,
  isNewReferenceData,
  findItemIndex,
  getUniqueRecordsUsingName,
} from "../../ReusableComponents/ReferenceDataComponent/utils";
import RegionsList from "./RegionsList";
import { useConfirmationDialogsHook } from "../../ReusableComponents/ConfirmationDialog";
import { awaitPromises } from "../../../util_funcs/awaitPromises";
import LoadingComponent from "../../ReusableComponents/LoadingComponent";
import LoadErrorComponent from "../../ReusableComponents/LoadErrorComponent";
import ReferenceDataAPI from "../../../api/referenceData";
import {
  kOptionIdField,
  kOptionNameField,
} from "../../ReusableComponents/QuestionTable/utils";

function RegionsContainer(props) {
  const { enqueueSnackbar } = useSnackbar();
  const { enqueueDialog } = useConfirmationDialogsHook();
  const [regions, setRegions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadItemsError, setLoadItemsError] = useState(null);
  const [updatingRegions, setUpdatingRegions] = useState(false);

  const getCountries = React.useCallback(async () => {
    // For whether the function completed successfully or not
    let status = false;
    setLoadItemsError(null);

    try {
      const countriesResult = await ReferenceDataAPI.getCountries();
      setCountries(countriesResult);
      status = true;
    } catch (err) {
      setLoadItemsError(err?.message || "Error loading countries");
      status = false;
    }

    return status;
  }, []);

  const getRegions = React.useCallback(async () => {
    // For whether the function completed successfully or not
    let status = false;
    setLoadItemsError(null);

    try {
      let regionsResult = await ReferenceDataAPI.getRegions();
      regionsResult = getUniqueRecordsUsingName(
        regionsResult,
        kOptionIdField,
        kOptionNameField
      );

      regionsResult = regionsResult.map((region) => {
        region.countries = [];
        return region;
      });

      setRegions(regionsResult);
      status = true;
    } catch (err) {
      setLoadItemsError(err?.message || "Error loading regions");
      status = false;
    }

    return status;
  }, []);

  const getData = React.useCallback(async (softLoad) => {
    if (!softLoad) {
      setLoadingItems(true);
    }

    // Call getRegions and call getCountries only if getRegions succeeds
    (await getRegions()) && (await getCountries());

    if (!softLoad) {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleSaveRegion = React.useCallback(
    async (region, updates = {}, showNotification = false) => {
      const isNewRegion = isNewReferenceData(region, kOptionIdField);

      if (isNewRegion) {
        region = { ...region, ...updates };
        await ReferenceDataAPI.addRegion(updates.optionText);

        if (showNotification) {
          enqueueSnackbar(
            `Region - ${region.optionText} - added successfully`,
            {
              variant: "success",
            }
          );
        }
      } else {
        const updatedRegion = { ...region, ...updates };

        if (updatedRegion.isActive === false) {
          updatedRegion.countries = [];
        }

        await ReferenceDataAPI.updateRegion(
          updatedRegion.optionText,
          updatedRegion.optionId,
          region.isActive
        );

        if (showNotification) {
          enqueueSnackbar(
            `Region - ${region.optionText} - updated successfully`,
            {
              variant: "success",
            }
          );
        }
      }
    },
    [regions, enqueueSnackbar]
  );

  // Updates countries and reloads the data
  const handleUpdateCountry = React.useCallback(
    async (country, updates = {}) => {
      try {
        const updatedCountry = { ...country, ...updates };
        await ReferenceDataAPI.updateCountryRegion(
          updatedCountry.optionId,
          updatedCountry.region,
          true
        );

        // Get latest changes
        await getCountries();
        enqueueSnackbar(
          `Country - ${country.optionText} - updated successfully`,
          {
            variant: "success",
          }
        );
      } catch (error) {
        const message =
          error?.message || `Error updating country - ${country.optionText}`;

        enqueueSnackbar(message, {
          variant: "error",
        });
      }
    },
    [countries, enqueueSnackbar]
  );

  const unassignRegionCountries = React.useCallback(
    async (region) => {
      const failed = [];
      const succeeded = [];
      const unassignCountriesPromises = region.countries.map((country) => {
        return {
          country,
          id: country.optionId,
          promise: ReferenceDataAPI.updateCountryRegion(
            country.optionId,
            0,
            false
          ),
        };
      });

      const unassignCountriesResult = await awaitPromises(
        unassignCountriesPromises
      );

      unassignCountriesResult.forEach((item) => {
        if (item.failed) {
          failed.push(item.country);
        } else {
          succeeded.push(item.country);
        }
      });

      const didAnyFail = failed.length > 0;

      if (didAnyFail) {
        enqueueSnackbar(
          `Error removing some countries from region - ${region.optionText}`,
          { variant: "error" }
        );
      }

      return { succeeded, failed };
    },
    [enqueueSnackbar]
  );

  const handleUpdateRegions = React.useCallback(
    async (updatedRegions) => {
      const succeeded = [];
      const failed = [];

      if (updatedRegions.length === 0) {
        return;
      }

      setUpdatingRegions(true);
      const regionsWithCountries = updatedRegions.filter((region) => {
        return region.isActive === false && region.countries.length > 0;
      });

      const dialogs = regionsWithCountries.map((region) => ({
        title: `Are you sure you want to make region ${region.optionText} inactive?`,
        message: `${region.optionText} has ${
          region.countries.length
        } assigned ${
          region.countries.length === 1 ? "country" : "countries"
        }, making it inactive will unassign these countries.`,
      }));

      const dialogsPromises = enqueueDialog(dialogs);
      const dialogConfirmations = await Promise.all(dialogsPromises);

      dialogConfirmations.forEach((confirmation, index) => {
        const regionIndex = findItemIndex(
          updatedRegions,
          regionsWithCountries[index].optionId,
          kOptionIdField
        );

        if (!confirmation) {
          updatedRegions.splice(regionIndex, 1);
        }
      });

      const updateRegionsPromises = updatedRegions
        .map(async (region) => {
          if (region.isActive === false && region.countries.length > 0) {
            const { failed: countriesFailed } = await unassignRegionCountries(
              region
            );

            if (countriesFailed.length > 0) {
              throw new Error("Error updating region");
            }
          }

          await handleSaveRegion(region, { isActive: region.isActive }, false);
        })
        .map((promise, index) => {
          return {
            promise,
            id: updatedRegions[index].optionId,
            region: updatedRegions[index],
          };
        });

      const updateRegionResults = await awaitPromises(updateRegionsPromises);
      updateRegionResults.forEach((result) => {
        if (result.failed) {
          failed.push(result.region);
        } else if (result.success) {
          succeeded.push(result.region);
        }
      });

      if (failed.length > 0) {
        enqueueSnackbar(
          `Error updating ${failed.length} region${
            failed.length > 1 ? "s" : ""
          }`,
          { variant: "error" }
        );
      }

      if (succeeded.length > 0) {
        enqueueSnackbar(
          `Successfully updated ${succeeded.length} region${
            succeeded.length > 1 ? "s" : ""
          }`,
          { variant: "success" }
        );
      }

      await getData(true);
      setUpdatingRegions(false);
    },
    [
      unassignRegionCountries,
      handleSaveRegion,
      countries,
      enqueueDialog,
      enqueueSnackbar,
      regions,
      getData,
    ]
  );

  const inactiveCountries = React.useMemo(() => {
    return countries.filter(
      (country) => country.region === undefined || country.region === null
    );
  }, [countries]);

  const regionsWithCountriesMapped = React.useMemo(() => {
    const mappedRegions = indexReferenceDataRecords(
      regions.map((region) => ({ ...region, countries: [] })),
      kOptionIdField
    );

    countries.forEach((country) => {
      const region = mappedRegions[country.region];

      if (region) {
        region.countries.push(country);
      }
    });

    return Object.values(mappedRegions);
  }, [regions, countries]);

  if (loadingItems) {
    return <LoadingComponent />;
  } else if (loadItemsError) {
    return <LoadErrorComponent message={loadItemsError} reloadData={getData} />;
  }

  return (
    <RegionsList
      countries={countries}
      disabled={updatingRegions}
      handleUpdateCountry={handleUpdateCountry}
      handleUpdateRegions={handleUpdateRegions}
      inactiveCountries={inactiveCountries}
      onSaveRegion={handleSaveRegion}
      regions={regionsWithCountriesMapped}
      getData={getData}
    />
  );
}

RegionsContainer.propTypes = {};

export default RegionsContainer;
