/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog.plugins.views.search.views.dynamicstartpage;

/*
 * Used with two constructors: activityType, itemId and userName for all Events except DELETE.
 * Because for DELETE, we can not lookup up title/type in the catalog later.
 * User is not part of the catalog so we use the userName instead of the id as we don't want to look up the user for everey activity
 */
public record RecentActivityEvent(ActivityType activityType, String itemId, String itemType, String itemTitle, String userName) {
    public RecentActivityEvent(ActivityType activityType, String itemdId, String userName) {
        this(activityType, itemdId, null, null, userName);
    }
}

