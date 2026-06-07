import { createBrowserRouter, RouterProvider } from "react-router";
import RetreiveResultsPage from "../pages/retreive-results-page";
import DocUploadPage from "../pages/doc-upload-page";

const router = createBrowserRouter([
    { path: "/", element: <RetreiveResultsPage /> },
    { path: "/upload-doc", element: <DocUploadPage /> },
])

const MainRoute = () => {
    return <RouterProvider router={router} />
}

export default MainRoute