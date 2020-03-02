#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..');

const transforms = {
  'members.json'(data) {
    const warnings = [];
    const transformedData = data
      .sort(function compare(a, b) {
        let locationA = a.location || '';
        let locationB = b.location || '';

        // ignore "GWU " prefix when sorting
        if (locationA.startsWith('GWU ')) {
          locationA = locationA.slice(4);
        }
        if (locationB.startsWith('GWU ')) {
          locationB = locationB.slice(4);
        }

        if (locationA === locationB) {
          return 0;
        }
        return locationA > locationB ? 1 : -1;
      })
      .map(function(member) {
        const {
          location,
          lat,
          lng,
          country,
          isChapter,
          isUnion,
          chapterInfo: {
            description,
            applicationLink,
            twitter,
            email,
            website,
            ...otherChapterInfo
          } = {},
          ...other
        } = member;

        // errors
        if (!location) {
          throw new Error(
            'ERROR: Missing location in object: ' + JSON.stringify(member, null, 1)
          );
        }
        for (const { name, isInvalid } of [
          { name: 'lat', isInvalid: val => typeof val !== 'number' },
          { name: 'lng', isInvalid: val => typeof val !== 'number' },
          { name: 'country', isInvalid: val => !val },
          { name: 'isChapter', isInvalid: val => typeof val !== 'boolean' },
          { name: 'isUnion', isInvalid: val => typeof val !== 'boolean' },
          { name: 'chapterInfo', isInvalid: val => (isChapter || isUnion) && typeof val !== 'object' }
        ]) {
          if (isInvalid(member[name])) {
            throw new Error(
              `ERROR: Invalid property "${name}" for location "${location}": ${JSON.stringify(member[name], null, 1)}`
            );
          }
        }

        // warnings
        for (const infoPropertyName of [
          'description',
          'applicationLink',
          'twitter',
          'email',
          'website'
        ]) {
          if (isChapter || isUnion) {
            if (!member.chapterInfo[infoPropertyName]) {
              warnings.push(
                `WARNING: missing chapter info "${infoPropertyName}" for location "${location}"`
              );
            }
          } else {
            if ((member.chapterInfo || {})[infoPropertyName]) {
              warnings.push(
                `WARNING: unexpected chapter info "${infoPropertyName}" for location "${location}" which is not marked as a chapter`
              );
            }
          }
        }
        if (Object.keys(other).length) {
          warnings.push(
            `WARNING: Unrecognized properties for location "${location}": ${JSON.stringify(other, null, 1)}`
          );
        }
        if (Object.keys(otherChapterInfo).length) {
          warnings.push(
            `WARNING: Unrecognized chapter info for location "${location}": ${JSON.stringify(otherChapterInfo, null, 1)}`
          );
        }

        return {
          location,
          lat,
          lng,
          country,
          isChapter,
          isUnion,
          chapterInfo: {
            description,
            applicationLink,
            twitter,
            email,
            website,
            ...otherChapterInfo
          },
          ...other
        };
      });

    return {
      data: transformedData,
      warnings
    };
  }
};

module.exports = {
  normalizeData() {
    const normalizedData = {};
    for (const [filepath, normalize] of Object.entries(transforms)) {
      const pathname = path.join(DATA_DIR, filepath);
      const data = require(pathname);
      const { data: normalized, warnings } = normalize(data);
      normalizedData[pathname] = {
        content: JSON.stringify(normalized, null, 2) + '\n',
        warnings
      };
    }
    return normalizedData;
  },
  transforms
};
